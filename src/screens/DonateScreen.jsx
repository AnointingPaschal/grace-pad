import React, { useState, useEffect, useRef } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Image, Modal, Pressable, Alert,
  ActivityIndicator, Animated, Linking, Dimensions,
  KeyboardAvoidingView, Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import {
  collection, addDoc, getDocs, updateDoc, deleteDoc,
  doc, serverTimestamp, query, orderBy, increment,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import { useSettings } from "../contexts/SettingsContext";
import MobileLayout from "../components/layout/MobileLayout";

const { width: W } = Dimensions.get("window");
const ADMIN_UID    = "Vt9zh9EDS4QsX84ti72dpkYvZqy2";
const PAYSTACK_KEY = "pk_live_YOUR_PAYSTACK_KEY"; // replace with your key

const PRESET_AMOUNTS = [1000, 2000, 5000, 10000, 20000, 50000];

const PAYMENT_METHODS = [
  {
    id:    "paystack",
    label: "Paystack",
    sub:   "Cards, Bank Transfer, USSD",
    icon:  "card-outline",
    badge: "RECOMMENDED",
    color: "#00C3F7",
  },
  {
    id:    "flutterwave",
    label: "Flutterwave",
    sub:   "Alternative secure gateway",
    icon:  "wallet-outline",
    badge: null,
    color: "#F5A623",
  },
  {
    id:    "bank",
    label: "Manual Bank Transfer",
    sub:   "Direct wire or local bank app",
    icon:  "business-outline",
    badge: "NO FEES",
    color: "#16A34A",
  },
];

const BANK_DETAILS = {
  name:    "The Witness Outreach",
  bank:    "First Bank of Nigeria",
  account: "3087654321",
  sort:    "011",
};

// ── CAUSE CARD ───────────────────────────────────────────────
function CauseCard({ cause, themeColor, onDonate, onEdit, onDelete, isAdmin }) {
  const raised   = cause.raised    || 0;
  const target   = cause.target    || 1;
  const pct      = Math.min(raised / target, 1);
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: pct,
      duration: 900,
      useNativeDriver: false,
    }).start();
  }, [pct]);

  const barW = progress.interpolate({ inputRange:[0,1], outputRange:["0%","100%"] });

  const fmtNGN = (n) => `₦${Number(n).toLocaleString("en-NG")}`;
  const pctLabel = `${Math.round(pct * 100)}%`;

  return (
    <View style={cs.causeCard}>
      {/* Image */}
      {cause.imageUrl ? (
        <Image source={{ uri: cause.imageUrl }} style={cs.causeImg} resizeMode="cover" />
      ) : (
        <LinearGradient
          colors={[themeColor, themeColor + "80"]}
          style={[cs.causeImg, cs.causeImgPlaceholder]}
        >
          <Ionicons name="heart-outline" size={32} color="rgba(255,255,255,0.5)" />
        </LinearGradient>
      )}

      {/* Category badge */}
      {cause.category && (
        <View style={[cs.causeBadge, { backgroundColor: themeColor }]}>
          <Text style={cs.causeBadgeTxt}>{cause.category.toUpperCase()}</Text>
        </View>
      )}

      {/* Admin controls */}
      {isAdmin && (
        <View style={cs.causeAdminBtns}>
          <TouchableOpacity style={cs.causeAdminBtn} onPress={() => onEdit(cause)}>
            <Ionicons name="pencil" size={14} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={[cs.causeAdminBtn, { backgroundColor: "#EF4444" }]} onPress={() => onDelete(cause)}>
            <Ionicons name="trash" size={14} color="#fff" />
          </TouchableOpacity>
        </View>
      )}

      <View style={cs.causeBody}>
        <Text style={cs.causeTitle}>{cause.title}</Text>
        <Text style={cs.causeDesc} numberOfLines={3}>{cause.description}</Text>

        {/* Progress */}
        <View style={cs.progressRow}>
          <View style={cs.progressTrack}>
            <Animated.View style={[cs.progressFill, { width: barW, backgroundColor: themeColor }]} />
          </View>
          <Text style={[cs.progressPct, { color: themeColor }]}>{pctLabel}</Text>
        </View>

        <View style={cs.causeMeta}>
          <View>
            <Text style={cs.metaLabel}>RAISED</Text>
            <Text style={[cs.metaValue, { color: themeColor }]}>{fmtNGN(raised)}</Text>
          </View>
          <View style={{ alignItems: "center" }}>
            <Text style={cs.metaLabel}>DONORS</Text>
            <Text style={cs.metaValue}>{cause.donors || 0}</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={cs.metaLabel}>TARGET</Text>
            <Text style={cs.metaValue}>{fmtNGN(target)}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[cs.donateBtn, { backgroundColor: themeColor }]}
          onPress={() => onDonate(cause)}
          activeOpacity={0.85}
        >
          <Ionicons name="heart" size={16} color="#fff" />
          <Text style={cs.donateBtnTxt}>Give to This Cause</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ── ADMIN CAUSE FORM ─────────────────────────────────────────
function CauseFormModal({ visible, cause, themeColor, onClose, onSave }) {
  const [title,    setTitle]    = useState(cause?.title       || "");
  const [desc,     setDesc]     = useState(cause?.description || "");
  const [target,   setTarget]   = useState(cause?.target?.toString() || "");
  const [imageUrl, setImageUrl] = useState(cause?.imageUrl    || "");
  const [category, setCategory] = useState(cause?.category   || "Outreach");
  const [saving,   setSaving]   = useState(false);

  const CATEGORIES = ["Outreach","Food","Clothing","Medical","Education","Welfare","Emergency"];

  const handleSave = async () => {
    if (!title.trim() || !desc.trim() || !target) {
      Alert.alert("Required", "Please fill in title, description and target amount.");
      return;
    }
    setSaving(true);
    await onSave({
      title:       title.trim(),
      description: desc.trim(),
      target:      Number(target.replace(/,/g,"")),
      imageUrl:    imageUrl.trim(),
      category:    category,
    });
    setSaving(false);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={fm.overlay} onPress={onClose}>
        <KeyboardAvoidingView behavior={Platform.OS==="ios"?"padding":undefined} style={{ width:"100%" }}>
          <Pressable style={fm.sheet}>
            <View style={fm.handle} />
            <Text style={fm.title}>{cause ? "Edit Cause" : "Add New Cause"}</Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={fm.label}>TITLE *</Text>
              <TextInput value={title} onChangeText={setTitle}
                placeholder="e.g. Feed 100 Families This Christmas"
                placeholderTextColor="#9CA3AF" style={fm.input} />

              <Text style={fm.label}>DESCRIPTION *</Text>
              <TextInput value={desc} onChangeText={setDesc}
                placeholder="Describe this outreach cause and how funds will be used..."
                placeholderTextColor="#9CA3AF" style={[fm.input, fm.textarea]}
                multiline textAlignVertical="top" />

              <Text style={fm.label}>TARGET AMOUNT (₦) *</Text>
              <TextInput value={target} onChangeText={setTarget}
                placeholder="e.g. 500000" placeholderTextColor="#9CA3AF"
                style={fm.input} keyboardType="numeric" />

              <Text style={fm.label}>IMAGE URL (optional)</Text>
              <TextInput value={imageUrl} onChangeText={setImageUrl}
                placeholder="https://..." placeholderTextColor="#9CA3AF"
                style={fm.input} autoCapitalize="none" />

              <Text style={fm.label}>CATEGORY</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap:8, paddingVertical:4, marginBottom:4 }}>
                {CATEGORIES.map(c => (
                  <TouchableOpacity key={c} onPress={() => setCategory(c)}
                    style={[fm.catChip, category===c && { backgroundColor:themeColor, borderColor:themeColor }]}>
                    <Text style={[fm.catChipTxt, category===c && { color:"#fff" }]}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={{ flexDirection:"row", gap:10, marginTop:16, marginBottom:30 }}>
                <TouchableOpacity style={fm.cancelBtn} onPress={onClose}>
                  <Text style={{ color:"#6B7280", fontWeight:"600" }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[fm.saveBtn, { backgroundColor:themeColor, opacity:saving?0.6:1 }]}
                  onPress={handleSave} disabled={saving}>
                  {saving
                    ? <ActivityIndicator color="#fff" size="small" />
                    : <><Ionicons name="checkmark" size={16} color="#fff" />
                        <Text style={fm.saveBtnTxt}>{cause ? "Update Cause" : "Publish Cause"}</Text></>
                  }
                </TouchableOpacity>
              </View>
            </ScrollView>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

// ── DONATE MODAL ─────────────────────────────────────────────
function DonateModal({ visible, cause, themeColor, onClose }) {
  const [amount,    setAmount]    = useState(null);
  const [custom,    setCustom]    = useState("");
  const [method,    setMethod]    = useState("paystack");
  const [donating,  setDonating]  = useState(false);
  const [showBank,  setShowBank]  = useState(false);

  const total = amount || Number(custom.replace(/,/g,"")) || 0;
  const fmtNGN = n => `₦${Number(n).toLocaleString("en-NG")}`;

  const handleDonate = async () => {
    if (!total || total < 100) {
      Alert.alert("Minimum", "Minimum donation is ₦100.");
      return;
    }
    if (method === "bank") { setShowBank(true); return; }

    setDonating(true);
    try {
      // Record the donation intent in Firestore
      if (cause?.id) {
        await updateDoc(doc(db, "donation_causes", cause.id), {
          raised: increment(total),
          donors: increment(1),
        });
      }
      await addDoc(collection(db, "donations"), {
        causeId:    cause?.id || "app_support",
        causeTitle: cause?.title || "Grace Pad App Support",
        amount:     total,
        method,
        createdAt:  serverTimestamp(),
      });

      // Open payment gateway
      if (method === "paystack") {
        Linking.openURL(`https://paystack.com/pay/gracepad?amount=${total * 100}`);
      } else {
        Linking.openURL(`https://flutterwave.com/pay/gracepad`);
      }
      onClose();
      Alert.alert("Thank You! 🙏", `Your donation of ${fmtNGN(total)} has been initiated. God bless you!`);
    } catch (e) {
      Alert.alert("Error", e.message);
    }
    setDonating(false);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={dm.overlay} onPress={onClose}>
        <Pressable style={dm.sheet}>
          <View style={dm.handle} />

          {/* Cause info */}
          {cause && (
            <View style={[dm.causeInfo, { borderLeftColor: themeColor }]}>
              <Text style={dm.causeInfoLabel}>GIVING TO</Text>
              <Text style={dm.causeInfoTitle}>{cause.title}</Text>
            </View>
          )}

          <Text style={dm.sectionLabel}>SELECT AMOUNT</Text>
          <View style={dm.amountGrid}>
            {PRESET_AMOUNTS.map(a => (
              <TouchableOpacity key={a}
                style={[dm.amountBtn, amount===a && { backgroundColor:themeColor, borderColor:themeColor }]}
                onPress={() => { setAmount(a); setCustom(""); }}>
                <Text style={[dm.amountBtnTxt, amount===a && { color:"#fff" }]}>₦{a.toLocaleString()}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={dm.customWrap}>
            <Text style={dm.currSign}>₦</Text>
            <TextInput value={custom}
              onChangeText={t => { setCustom(t); setAmount(null); }}
              placeholder="Custom Amount"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              style={dm.customInput} />
          </View>

          <Text style={[dm.sectionLabel, { marginTop:16 }]}>PAYMENT METHOD</Text>
          {PAYMENT_METHODS.map(pm => (
            <TouchableOpacity key={pm.id}
              style={[dm.methodRow, method===pm.id && { borderColor:themeColor, backgroundColor:themeColor+"08" }]}
              onPress={() => setMethod(pm.id)}>
              <View style={[dm.methodIcon, { backgroundColor: pm.color+"20" }]}>
                <Ionicons name={pm.icon} size={20} color={pm.color} />
              </View>
              <View style={{ flex:1 }}>
                <View style={{ flexDirection:"row", alignItems:"center", gap:8 }}>
                  <Text style={dm.methodLabel}>{pm.label}</Text>
                  {pm.badge && (
                    <View style={[dm.methodBadge, { backgroundColor: pm.color+"25" }]}>
                      <Text style={[dm.methodBadgeTxt, { color: pm.color }]}>{pm.badge}</Text>
                    </View>
                  )}
                </View>
                <Text style={dm.methodSub}>{pm.sub}</Text>
              </View>
              <View style={[dm.radio, method===pm.id && { borderColor:themeColor }]}>
                {method===pm.id && <View style={[dm.radioFill, { backgroundColor:themeColor }]} />}
              </View>
            </TouchableOpacity>
          ))}

          {/* Total + CTA */}
          <View style={dm.footer}>
            <View>
              <Text style={dm.totalLabel}>TOTAL DONATION</Text>
              <Text style={[dm.totalAmount, { color:themeColor }]}>
                {total ? `₦${total.toLocaleString()}` : "₦0"}
              </Text>
            </View>
            <TouchableOpacity
              style={[dm.donateBtn, { backgroundColor:themeColor, opacity:donating||!total?0.5:1 }]}
              onPress={handleDonate} disabled={donating || !total}>
              {donating
                ? <ActivityIndicator color="#fff" size="small" />
                : <><Text style={dm.donateBtnTxt}>Donate</Text>
                    <Ionicons name="arrow-forward" size={16} color="#fff" /></>
              }
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>

      {/* Bank details sub-modal */}
      <Modal visible={showBank} transparent animationType="fade">
        <Pressable style={dm.overlay} onPress={() => setShowBank(false)}>
          <Pressable style={dm.bankSheet}>
            <Text style={dm.bankTitle}>Bank Transfer Details</Text>
            <View style={dm.bankRow}>
              <Text style={dm.bankKey}>Account Name</Text>
              <Text style={dm.bankVal}>{BANK_DETAILS.name}</Text>
            </View>
            <View style={dm.bankRow}>
              <Text style={dm.bankKey}>Bank</Text>
              <Text style={dm.bankVal}>{BANK_DETAILS.bank}</Text>
            </View>
            <View style={dm.bankRow}>
              <Text style={dm.bankKey}>Account No.</Text>
              <Text style={[dm.bankVal, { fontWeight:"800", fontSize:18 }]}>{BANK_DETAILS.account}</Text>
            </View>
            <View style={dm.bankRow}>
              <Text style={dm.bankKey}>Amount</Text>
              <Text style={[dm.bankVal, { color:themeColor, fontWeight:"700" }]}>{fmtNGN(total)}</Text>
            </View>
            <Text style={dm.bankNote}>
              After transfer, send your receipt to{"\n"}ozoemenapaschal09@gmail.com — God bless you!
            </Text>
            <TouchableOpacity style={[dm.donateBtn, { backgroundColor:themeColor, width:"100%", justifyContent:"center", marginTop:12 }]}
              onPress={() => { setShowBank(false); onClose(); }}>
              <Text style={dm.donateBtnTxt}>Done — I've Transferred</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </Modal>
  );
}

// ── MAIN SCREEN ──────────────────────────────────────────────
export default function DonateScreen() {
  const navigation = useNavigation();
  const insets     = useSafeAreaInsets();
  const { user }   = useAuth() || {};
  const { themeColor = "#160A47" } = useSettings() || {};

  const isAdmin = user?.uid === ADMIN_UID;

  const [causes,        setCauses]        = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [donateModal,   setDonateModal]   = useState(false);
  const [selectedCause, setSelectedCause] = useState(null); // null = app support
  const [formModal,     setFormModal]     = useState(false);
  const [editingCause,  setEditingCause]  = useState(null);

  const fetchCauses = async () => {
    setLoading(true);
    try {
      const q    = query(collection(db, "donation_causes"), orderBy("createdAt","desc"));
      const snap = await getDocs(q);
      setCauses(snap.docs.map(d => ({ id:d.id, ...d.data() })));
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchCauses(); }, []);

  const handleDonate = (cause) => {
    setSelectedCause(cause);
    setDonateModal(true);
  };

  const handleSaveCause = async (data) => {
    try {
      if (editingCause) {
        await updateDoc(doc(db,"donation_causes",editingCause.id), { ...data, updatedAt:serverTimestamp() });
        Alert.alert("Updated","Cause updated successfully.");
      } else {
        await addDoc(collection(db,"donation_causes"), {
          ...data, raised:0, donors:0, createdAt:serverTimestamp(),
        });
        Alert.alert("Published","New cause is now live!");
      }
      setFormModal(false);
      setEditingCause(null);
      await fetchCauses();
    } catch (e) { Alert.alert("Error", e.message); }
  };

  const handleEditCause = (cause) => { setEditingCause(cause); setFormModal(true); };

  const handleDeleteCause = (cause) => {
    Alert.alert("Delete Cause?", `Remove "${cause.title}"? This cannot be undone.`,[
      { text:"Cancel", style:"cancel" },
      { text:"Delete", style:"destructive", onPress: async () => {
        await deleteDoc(doc(db,"donation_causes",cause.id));
        await fetchCauses();
      }},
    ]);
  };

  const totalRaised = causes.reduce((s,c) => s + (c.raised||0), 0);
  const totalDonors = causes.reduce((s,c) => s + (c.donors||0), 0);

  return (
    <MobileLayout hideAIFab>
      <View style={{ flex:1, backgroundColor:"#F9FAFB" }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom:60 }}>

          {/* ── HERO ── */}
          <LinearGradient colors={[themeColor, "#000"]} style={s.hero} start={{x:0,y:0}} end={{x:1,y:1}}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
              <Ionicons name="arrow-back" size={22} color="#fff" />
            </TouchableOpacity>

            <View style={s.heroIcon}>
              <Ionicons name="heart" size={32} color="#C8971B" />
            </View>
            <Text style={s.heroTitle}>The Witness Outreach</Text>
            <Text style={s.heroSub}>
              Supporting the less privileged through food, clothing, welfare and
              community empowerment — one act of love at a time.
            </Text>
            <Text style={s.heroVerse}>
              "Each of you should give what you have decided in your heart to give,
              not reluctantly or under compulsion, for God loves a cheerful giver."
            </Text>
            <Text style={[s.heroRef, { color:"#C8971B" }]}>— 2 Corinthians 9:7</Text>

            {/* Stats bar */}
            {totalRaised > 0 && (
              <View style={s.statsBar}>
                <View style={s.statItem}>
                  <Text style={s.statNum}>₦{(totalRaised/1000).toFixed(0)}K</Text>
                  <Text style={s.statLbl}>Raised</Text>
                </View>
                <View style={s.statDiv} />
                <View style={s.statItem}>
                  <Text style={s.statNum}>{causes.length}</Text>
                  <Text style={s.statLbl}>Active Causes</Text>
                </View>
                <View style={s.statDiv} />
                <View style={s.statItem}>
                  <Text style={s.statNum}>{totalDonors}</Text>
                  <Text style={s.statLbl}>Donors</Text>
                </View>
              </View>
            )}
          </LinearGradient>

          {/* ── ADMIN — ADD CAUSE ── */}
          {isAdmin && (
            <TouchableOpacity
              style={[s.addCauseBtn, { backgroundColor:themeColor }]}
              onPress={() => { setEditingCause(null); setFormModal(true); }}
            >
              <Ionicons name="add-circle-outline" size={20} color="#fff" />
              <Text style={s.addCauseBtnTxt}>Add New Outreach Cause</Text>
            </TouchableOpacity>
          )}

          {/* ── ACTIVE CAUSES ── */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>ACTIVE CAUSES</Text>
            <Text style={s.sectionSub}>
              Every donation goes directly to serving those in need.
              Choose a cause below or give a general offering.
            </Text>
          </View>

          {loading ? (
            <View style={s.loadingBox}>
              <ActivityIndicator size="large" color={themeColor} />
              <Text style={s.loadingTxt}>Loading causes...</Text>
            </View>
          ) : causes.length === 0 ? (
            <View style={s.emptyBox}>
              <Ionicons name="heart-outline" size={48} color="#D1D5DB" />
              <Text style={s.emptyTxt}>No active causes yet.</Text>
              {isAdmin && (
                <TouchableOpacity
                  style={[s.emptyBtn, { backgroundColor:themeColor }]}
                  onPress={() => { setEditingCause(null); setFormModal(true); }}
                >
                  <Text style={s.emptyBtnTxt}>Add First Cause</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={{ paddingHorizontal:16, gap:16 }}>
              {causes.map(cause => (
                <CauseCard
                  key={cause.id}
                  cause={cause}
                  themeColor={themeColor}
                  isAdmin={isAdmin}
                  onDonate={handleDonate}
                  onEdit={handleEditCause}
                  onDelete={handleDeleteCause}
                />
              ))}
            </View>
          )}

          {/* ── GENERAL APP SUPPORT ── */}
          <View style={[s.appSupportCard, { borderColor: themeColor+"30" }]}>
            <LinearGradient colors={[themeColor+"15","transparent"]} style={s.appSupportGrad}>
              <View style={s.appSupportTop}>
                <View style={[s.appSupportIcon, { backgroundColor:themeColor+"20" }]}>
                  <Ionicons name="phone-portrait-outline" size={22} color={themeColor} />
                </View>
                <View style={{ flex:1 }}>
                  <Text style={s.appSupportTitle}>Support Grace Pad App</Text>
                  <Text style={s.appSupportSub}>Keep the app free, ad-free, and growing</Text>
                </View>
              </View>
              <Text style={s.appSupportDesc}>
                Grace Pad is 100% free and ad-free. Your support helps us maintain
                servers, add new Bible translations, and build features that serve
                believers worldwide. Every amount makes a difference.
              </Text>
              <TouchableOpacity
                style={[s.appSupportBtn, { backgroundColor:themeColor }]}
                onPress={() => handleDonate(null)}
              >
                <Ionicons name="heart-outline" size={16} color="#fff" />
                <Text style={s.appSupportBtnTxt}>Support the App</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>

          {/* ── WHY GIVE ── */}
          <View style={s.whySection}>
            <Text style={s.whyTitle}>Why We Do This</Text>
            {[
              { icon:"restaurant-outline",  title:"Food Distributions",   desc:"We provide meals to hungry families in underserved communities." },
              { icon:"shirt-outline",        title:"Clothing Drives",      desc:"Distributing clothing to those who cannot afford basic needs." },
              { icon:"medkit-outline",       title:"Medical Support",      desc:"Helping families access basic healthcare and medications." },
              { icon:"school-outline",       title:"Education Aid",        desc:"Supporting children who cannot afford school fees and materials." },
              { icon:"home-outline",         title:"Welfare Support",      desc:"Emergency financial aid to families in critical situations." },
            ].map((item, i) => (
              <View key={i} style={s.whyItem}>
                <View style={[s.whyIcon, { backgroundColor: themeColor+"15" }]}>
                  <Ionicons name={item.icon} size={20} color={themeColor} />
                </View>
                <View style={{ flex:1 }}>
                  <Text style={s.whyItemTitle}>{item.title}</Text>
                  <Text style={s.whyItemDesc}>{item.desc}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* ── FOOTER SCRIPTURE ── */}
          <View style={s.footerScripture}>
            <Ionicons name="bookmark-outline" size={18} color="#C8971B" />
            <Text style={s.footerVerse}>
              "The righteous give without sparing." — Proverbs 21:26
            </Text>
          </View>

        </ScrollView>

        {/* ── MODALS ── */}
        <DonateModal
          visible={donateModal}
          cause={selectedCause}
          themeColor={themeColor}
          onClose={() => setDonateModal(false)}
        />

        {formModal && (
          <CauseFormModal
            visible={formModal}
            cause={editingCause}
            themeColor={themeColor}
            onClose={() => { setFormModal(false); setEditingCause(null); }}
            onSave={handleSaveCause}
          />
        )}
      </View>
    </MobileLayout>
  );
}

// ── STYLES ───────────────────────────────────────────────────
const s = StyleSheet.create({
  hero:          { paddingTop:60, paddingHorizontal:24, paddingBottom:28, alignItems:"center" },
  backBtn:       { position:"absolute", top:52, left:20, width:38, height:38, borderRadius:19, backgroundColor:"rgba(255,255,255,0.15)", alignItems:"center", justifyContent:"center" },
  heroIcon:      { width:72, height:72, borderRadius:36, backgroundColor:"rgba(200,151,27,0.2)", alignItems:"center", justifyContent:"center", marginBottom:16, borderWidth:2, borderColor:"rgba(200,151,27,0.4)" },
  heroTitle:     { fontSize:24, fontWeight:"800", color:"#fff", fontFamily:"serif", textAlign:"center", marginBottom:10 },
  heroSub:       { fontSize:14, color:"rgba(255,255,255,0.8)", textAlign:"center", lineHeight:22, marginBottom:16 },
  heroVerse:     { fontSize:13, color:"rgba(255,255,255,0.65)", fontStyle:"italic", textAlign:"center", lineHeight:21, marginBottom:6 },
  heroRef:       { fontSize:12, fontWeight:"700", marginBottom:16 },
  statsBar:      { flexDirection:"row", backgroundColor:"rgba(255,255,255,0.12)", borderRadius:16, paddingVertical:14, paddingHorizontal:20, width:"100%", marginTop:8 },
  statItem:      { flex:1, alignItems:"center" },
  statNum:       { fontSize:18, fontWeight:"800", color:"#fff" },
  statLbl:       { fontSize:10, color:"rgba(255,255,255,0.65)", marginTop:2 },
  statDiv:       { width:1, backgroundColor:"rgba(255,255,255,0.2)" },
  addCauseBtn:   { flexDirection:"row", alignItems:"center", justifyContent:"center", gap:8, margin:16, padding:16, borderRadius:14, elevation:4, shadowColor:"#000", shadowOpacity:0.15, shadowRadius:8 },
  addCauseBtnTxt:{ fontSize:15, fontWeight:"700", color:"#fff" },
  section:       { paddingHorizontal:16, paddingTop:20, paddingBottom:8 },
  sectionTitle:  { fontSize:11, fontWeight:"800", color:"#9CA3AF", letterSpacing:1.5, marginBottom:6 },
  sectionSub:    { fontSize:13, color:"#6B7280", lineHeight:20 },
  loadingBox:    { alignItems:"center", padding:40, gap:12 },
  loadingTxt:    { fontSize:14, color:"#9CA3AF" },
  emptyBox:      { alignItems:"center", padding:40, gap:12 },
  emptyTxt:      { fontSize:16, fontWeight:"600", color:"#9CA3AF" },
  emptyBtn:      { paddingHorizontal:24, paddingVertical:12, borderRadius:12 },
  emptyBtnTxt:   { fontSize:14, fontWeight:"700", color:"#fff" },
  appSupportCard:{ margin:16, borderRadius:18, borderWidth:1, overflow:"hidden", backgroundColor:"#fff", elevation:2, shadowColor:"#000", shadowOpacity:0.06, shadowRadius:8 },
  appSupportGrad:{ padding:20 },
  appSupportTop: { flexDirection:"row", alignItems:"center", gap:12, marginBottom:12 },
  appSupportIcon:{ width:44, height:44, borderRadius:12, alignItems:"center", justifyContent:"center" },
  appSupportTitle:{ fontSize:16, fontWeight:"700", color:"#111827" },
  appSupportSub: { fontSize:12, color:"#9CA3AF", marginTop:2 },
  appSupportDesc:{ fontSize:13, color:"#6B7280", lineHeight:20, marginBottom:14 },
  appSupportBtn: { flexDirection:"row", alignItems:"center", justifyContent:"center", gap:8, paddingVertical:14, borderRadius:12 },
  appSupportBtnTxt:{ fontSize:14, fontWeight:"700", color:"#fff" },
  whySection:    { margin:16, backgroundColor:"#fff", borderRadius:16, padding:16, elevation:2, shadowColor:"#000", shadowOpacity:0.05, shadowRadius:6 },
  whyTitle:      { fontSize:16, fontWeight:"700", color:"#111827", marginBottom:14, fontFamily:"serif" },
  whyItem:       { flexDirection:"row", alignItems:"flex-start", gap:12, marginBottom:14 },
  whyIcon:       { width:40, height:40, borderRadius:10, alignItems:"center", justifyContent:"center", flexShrink:0 },
  whyItemTitle:  { fontSize:14, fontWeight:"700", color:"#111827", marginBottom:2 },
  whyItemDesc:   { fontSize:12, color:"#6B7280", lineHeight:18 },
  footerScripture:{ flexDirection:"row", alignItems:"center", gap:10, margin:16, padding:16, backgroundColor:"#FFFBEB", borderRadius:12, borderWidth:1, borderColor:"#FDE68A" },
  footerVerse:   { flex:1, fontSize:13, fontStyle:"italic", color:"#92400E", lineHeight:20 },
});

const cs = StyleSheet.create({
  causeCard:     { backgroundColor:"#fff", borderRadius:18, overflow:"hidden", elevation:4, shadowColor:"#000", shadowOpacity:0.1, shadowRadius:12 },
  causeImg:      { width:"100%", height:180 },
  causeImgPlaceholder:{ alignItems:"center", justifyContent:"center" },
  causeBadge:    { position:"absolute", top:12, left:12, paddingHorizontal:10, paddingVertical:4, borderRadius:20 },
  causeBadgeTxt: { fontSize:9, fontWeight:"800", color:"#fff", letterSpacing:1 },
  causeAdminBtns:{ position:"absolute", top:12, right:12, flexDirection:"row", gap:6 },
  causeAdminBtn: { width:30, height:30, borderRadius:8, backgroundColor:"rgba(0,0,0,0.5)", alignItems:"center", justifyContent:"center" },
  causeBody:     { padding:16 },
  causeTitle:    { fontSize:17, fontWeight:"800", color:"#111827", fontFamily:"serif", marginBottom:6 },
  causeDesc:     { fontSize:13, color:"#6B7280", lineHeight:20, marginBottom:14 },
  progressRow:   { flexDirection:"row", alignItems:"center", gap:8, marginBottom:12 },
  progressTrack: { flex:1, height:8, backgroundColor:"#F3F4F6", borderRadius:4, overflow:"hidden" },
  progressFill:  { height:"100%", borderRadius:4 },
  progressPct:   { fontSize:12, fontWeight:"700", minWidth:34, textAlign:"right" },
  causeMeta:     { flexDirection:"row", justifyContent:"space-between", marginBottom:14 },
  metaLabel:     { fontSize:9, fontWeight:"700", color:"#9CA3AF", letterSpacing:1, marginBottom:2 },
  metaValue:     { fontSize:14, fontWeight:"700", color:"#111827" },
  donateBtn:     { flexDirection:"row", alignItems:"center", justifyContent:"center", gap:8, paddingVertical:14, borderRadius:12 },
  donateBtnTxt:  { fontSize:14, fontWeight:"700", color:"#fff" },
});

const fm = StyleSheet.create({
  overlay:    { flex:1, backgroundColor:"rgba(0,0,0,0.5)", justifyContent:"flex-end" },
  sheet:      { backgroundColor:"#fff", borderTopLeftRadius:24, borderTopRightRadius:24, maxHeight:"90%", padding:20 },
  handle:     { width:40, height:4, borderRadius:2, backgroundColor:"#E5E7EB", alignSelf:"center", marginBottom:16 },
  title:      { fontSize:18, fontWeight:"800", color:"#111827", marginBottom:16, fontFamily:"serif" },
  label:      { fontSize:10, fontWeight:"800", color:"#9CA3AF", letterSpacing:1.5, marginBottom:6, marginTop:12 },
  input:      { borderWidth:1.5, borderColor:"#E5E7EB", borderRadius:10, paddingHorizontal:14, paddingVertical:11, fontSize:14, color:"#111827", backgroundColor:"#F9FAFB" },
  textarea:   { minHeight:90, textAlignVertical:"top", lineHeight:22 },
  catChip:    { paddingHorizontal:14, paddingVertical:7, borderRadius:20, backgroundColor:"#F3F4F6", borderWidth:1, borderColor:"#E5E7EB" },
  catChipTxt: { fontSize:12, fontWeight:"600", color:"#374151" },
  cancelBtn:  { flex:1, alignItems:"center", paddingVertical:14, borderRadius:10, backgroundColor:"#F3F4F6" },
  saveBtn:    { flex:1, flexDirection:"row", alignItems:"center", justifyContent:"center", gap:8, paddingVertical:14, borderRadius:10 },
  saveBtnTxt: { fontSize:14, fontWeight:"700", color:"#fff" },
});

const dm = StyleSheet.create({
  overlay:       { flex:1, backgroundColor:"rgba(0,0,0,0.5)", justifyContent:"flex-end" },
  sheet:         { backgroundColor:"#fff", borderTopLeftRadius:24, borderTopRightRadius:24, padding:20, maxHeight:"88%" },
  handle:        { width:40, height:4, borderRadius:2, backgroundColor:"#E5E7EB", alignSelf:"center", marginBottom:16 },
  causeInfo:     { borderLeftWidth:4, paddingLeft:12, marginBottom:16 },
  causeInfoLabel:{ fontSize:9, fontWeight:"800", color:"#9CA3AF", letterSpacing:1.5 },
  causeInfoTitle:{ fontSize:15, fontWeight:"700", color:"#111827", marginTop:2 },
  sectionLabel:  { fontSize:10, fontWeight:"800", color:"#9CA3AF", letterSpacing:1.5, marginBottom:10 },
  amountGrid:    { flexDirection:"row", flexWrap:"wrap", gap:10, marginBottom:12 },
  amountBtn:     { width:(W-56)/3, paddingVertical:12, borderRadius:10, borderWidth:1.5, borderColor:"#E5E7EB", alignItems:"center", backgroundColor:"#F9FAFB" },
  amountBtnTxt:  { fontSize:13, fontWeight:"700", color:"#374151" },
  customWrap:    { flexDirection:"row", alignItems:"center", borderWidth:1.5, borderColor:"#E5E7EB", borderRadius:10, paddingHorizontal:14, backgroundColor:"#F9FAFB" },
  currSign:      { fontSize:16, fontWeight:"700", color:"#9CA3AF", marginRight:4 },
  customInput:   { flex:1, fontSize:15, color:"#111827", paddingVertical:12 },
  methodRow:     { flexDirection:"row", alignItems:"center", gap:12, padding:14, borderRadius:12, borderWidth:1.5, borderColor:"#E5E7EB", marginBottom:10, backgroundColor:"#fff" },
  methodIcon:    { width:40, height:40, borderRadius:10, alignItems:"center", justifyContent:"center" },
  methodLabel:   { fontSize:14, fontWeight:"700", color:"#111827" },
  methodBadge:   { paddingHorizontal:8, paddingVertical:2, borderRadius:20 },
  methodBadgeTxt:{ fontSize:9, fontWeight:"800", letterSpacing:0.5 },
  methodSub:     { fontSize:12, color:"#9CA3AF", marginTop:2 },
  radio:         { width:20, height:20, borderRadius:10, borderWidth:2, borderColor:"#E5E7EB", alignItems:"center", justifyContent:"center" },
  radioFill:     { width:10, height:10, borderRadius:5 },
  footer:        { flexDirection:"row", alignItems:"center", justifyContent:"space-between", paddingTop:16, marginTop:4, borderTopWidth:1, borderTopColor:"#F3F4F6" },
  totalLabel:    { fontSize:9, fontWeight:"800", color:"#9CA3AF", letterSpacing:1.5 },
  totalAmount:   { fontSize:22, fontWeight:"800", marginTop:2 },
  donateBtn:     { flexDirection:"row", alignItems:"center", gap:8, paddingHorizontal:24, paddingVertical:14, borderRadius:14 },
  donateBtnTxt:  { fontSize:15, fontWeight:"700", color:"#fff" },
  bankSheet:     { backgroundColor:"#fff", borderRadius:24, padding:24, margin:20 },
  bankTitle:     { fontSize:18, fontWeight:"800", color:"#111827", fontFamily:"serif", marginBottom:16 },
  bankRow:       { flexDirection:"row", justifyContent:"space-between", alignItems:"center", paddingVertical:12, borderBottomWidth:1, borderBottomColor:"#F3F4F6" },
  bankKey:       { fontSize:12, color:"#9CA3AF", fontWeight:"600" },
  bankVal:       { fontSize:14, color:"#111827", fontWeight:"600", textAlign:"right", flex:1, marginLeft:12 },
  bankNote:      { fontSize:12, color:"#6B7280", lineHeight:18, textAlign:"center", marginTop:12 },
});
