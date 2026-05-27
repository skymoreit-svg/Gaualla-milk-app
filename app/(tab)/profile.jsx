import axios from "axios";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { Bell, BookOpen, ChevronRight, FileText, Heart, HelpCircle, Info, LogOut, MapPin, Shield, ShoppingBag, User, Wallet } from "lucide-react-native";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { baseurl } from "../../allapi";
import { clearUser } from "../store/userSlice";

export default function Profile() {
  const { isUser, info } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const router = useRouter();

  const handleTriggerScheduler = async () => {
    try {
      const adminUrl = baseurl.replace("/api/user", "");
      const response = await axios.post(`${adminUrl}/admin/trigger-scheduler`, {}, {
        headers: { "Content-Type": "application/json" }
      });
      if (response.status === 200 || response.data?.success) {
        Alert.alert("Success", "Daily subscription scheduler triggered successfully!");
      } else {
        Alert.alert("Execution Alert", "Scheduler execution completed with status: " + response.status);
      }
    } catch (error) {
      console.error("Scheduler trigger error:", error);
      Alert.alert("Trigger Failed", "Ensure backend is running and /admin/trigger-scheduler is reachable.");
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      "Confirm Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          onPress: async () => {
            try {
              await SecureStore.deleteItemAsync("authToken");
              dispatch(clearUser());
            } catch (error) {
              Alert.alert("Error", "Failed to clear token");
            }
          }
        }
      ]
    );
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      "Delete Account",
      "This will permanently delete your account and personal data. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await SecureStore.getItemAsync("authToken");
              if (!token) {
                Alert.alert("Session Expired", "Please login again.");
                return;
              }

              const response = await axios.delete(`${baseurl}/delete-account`, {
                headers: { Authorization: `Bearer ${token}` },
              });

              if (response?.data?.success) {
                await SecureStore.deleteItemAsync("authToken");
                dispatch(clearUser());
                Alert.alert("Account Deleted", "Your account has been deleted successfully.");
              } else {
                Alert.alert("Error", response?.data?.message || "Failed to delete account.");
              }
            } catch (error) {
              console.log("Delete account error:", error);
              Alert.alert("Error", "Failed to delete account. Please try again.");
            }
          },
        },
      ]
    );
  };

  // ── Not logged in state ──────────────────────────────────────────
  if (!isUser) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#F6EFC8", alignItems: "center", justifyContent: "center", padding: 32 }}>
        <View
          style={{
            width: 100,
            height: 100,
            borderRadius: 50,
            backgroundColor: "#fdf6f3",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 24,
            borderWidth: 1,
            borderColor: "#f0e0d8",
          }}
        >
          <User size={44} color="#6d4c41" />
        </View>
        <Text style={{ fontSize: 22, fontWeight: "800", color: "#1f2937", marginBottom: 8, textAlign: "center" }}>
          Welcome to Gaualla
        </Text>
        <Text style={{ fontSize: 13, color: "#9ca3af", textAlign: "center", marginBottom: 28, lineHeight: 18 }}>
          Log in to manage your daily milk subscriptions, view order history, and access exclusive VIP wallet benefits.
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/singlepage/login")}
          style={{ backgroundColor: "#3e2723", paddingHorizontal: 36, paddingVertical: 14, borderRadius: 16 }}
          activeOpacity={0.9}
        >
          <Text style={{ color: "#fff", fontSize: 15, fontWeight: "700" }}>Login / Register</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Initial letter of the user's name
  const nameInitial = info?.user?.name ? info.user.name.charAt(0).toUpperCase() : "G";

  const MenuItem = ({ icon: Icon, label, description, onPress, isLast }) => (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: "#fff",
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: "#f5ede8",
      }}
      activeOpacity={0.7}
    >
      <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
        <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: "#fdf6f3", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#f0e0d8", marginRight: 14 }}>
          <Icon size={18} color="#6d4c41" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 15, fontWeight: "600", color: "#1f2937" }}>{label}</Text>
          {description && (
            <Text style={{ fontSize: 11, color: "#9ca3af", marginTop: 1 }}>{description}</Text>
          )}
        </View>
      </View>
      <ChevronRight size={18} color="#d1d5db" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F6EFC8" }} edges={['top', 'left', 'right']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>
        {/* Premium Header */}
        <View style={{ paddingHorizontal: 20, paddingTop: 16, pb: 12 }}>
          <Text style={{ fontSize: 28, fontWeight: "900", color: "#1f2937", letterSpacing: -0.5 }}>
            My Account
          </Text>
        </View>

        {/* 🌟 Profile Card (VIP Theme) */}
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 24,
            marginHorizontal: 16,
            marginTop: 8,
            padding: 20,
            borderWidth: 1,
            borderColor: "#f5ede8",
            shadowColor: "#3e2723",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.06,
            shadowRadius: 12,
            elevation: 4,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {/* Elegant Letter Avatar */}
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: "#3e2723",
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 2,
                borderColor: "#fbbf24",
                shadowColor: "#3e2723",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 6,
                elevation: 3,
              }}
            >
              <Text style={{ color: "#fff", fontSize: 24, fontWeight: "800" }}>{nameInitial}</Text>
            </View>

            <View style={{ marginLeft: 16, flex: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 3 }}>
                <Text style={{ fontSize: 18, fontWeight: "800", color: "#1f2937" }}>
                  {info?.user?.name || "User Name"}
                </Text>
                <View style={{ backgroundColor: "#fef3c7", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, borderWidth: 0.5, borderColor: "#fde68a" }}>
                  <Text style={{ color: "#b45309", fontSize: 9, fontWeight: "800", textTransform: "uppercase" }}>VIP Member</Text>
                </View>
              </View>
              <Text style={{ fontSize: 12, color: "#6b7280", marginBottom: 1 }} numberOfLines={1}>
                {info?.user?.email || "user@example.com"}
              </Text>
              <Text style={{ fontSize: 12, color: "#6b7280" }}>
                {info?.user?.phone || "+1 234 567 8900"}
              </Text>
            </View>
          </View>

          {/* Quick Stats / Wallet Preview */}
          <TouchableOpacity
            onPress={() => router.push("/singlepage/wallet")}
            style={{
              marginTop: 18,
              backgroundColor: "#fdf8f6",
              borderRadius: 16,
              padding: 14,
              borderWidth: 1,
              borderColor: "#f0e0d8",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between"
            }}
            activeOpacity={0.85}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: "#fbbf24", alignItems: "center", justifyContent: "center", marginRight: 12 }}>
                <Wallet size={16} color="#fff" />
              </View>
              <View>
                <Text style={{ fontSize: 11, color: "#9ca3af", fontWeight: "600", textTransform: "uppercase" }}>Gaualla Wallet</Text>
                <Text style={{ fontSize: 16, fontWeight: "800", color: "#3e2723", marginTop: 1 }}>Active Account</Text>
              </View>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <Text style={{ fontSize: 12, fontWeight: "700", color: "#6d4c41" }}>Top-up Balance</Text>
              <ChevronRight size={14} color="#6d4c41" />
            </View>
          </TouchableOpacity>
        </View>

        {/* ── Section: Account Info ─────────────────────────── */}
        <View style={{ marginTop: 24 }}>
          <Text style={{ fontSize: 11, fontWeight: "700", color: "#9ca3af", marginHorizontal: 20, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>
            Account Settings
          </Text>
          <View style={{ backgroundColor: "#fff", marginHorizontal: 16, borderRadius: 20, overflow: "hidden", borderWidth: 1, borderColor: "#f5ede8" }}>
            <MenuItem
              icon={User}
              label="Personal Information"
              description="View your account profile details"
              onPress={() => router.push("/singlepage/personal-info")}
            />
            <MenuItem
              icon={MapPin}
              label="Delivery Address"
              description="Manage your household delivery destinations"
              onPress={() => router.push("/singlepage/addresses")}
            />
            <MenuItem
              icon={Wallet}
              label="VIP Dairy Wallet"
              description="Check transactions history & add money"
              onPress={() => router.push("/singlepage/wallet")}
              isLast={true}
            />
          </View>
        </View>

        {/* ── Section: Dairy Activities ─────────────────────────── */}
        <View style={{ marginTop: 24 }}>
          <Text style={{ fontSize: 11, fontWeight: "700", color: "#9ca3af", marginHorizontal: 20, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>
            Dairy Activities
          </Text>
          <View style={{ backgroundColor: "#fff", marginHorizontal: 16, borderRadius: 20, overflow: "hidden", borderWidth: 1, borderColor: "#f5ede8" }}>
            <MenuItem
              icon={ShoppingBag}
              label="My Orders"
              description="Track live order status & history"
              onPress={() => router.push("/(tab)/order")}
            />
            <MenuItem
              icon={Heart}
              label="My Wishlist"
              description="Saved favorites for quick delivery"
              onPress={() => router.push("/singlepage/wishlist")}
            />
            <MenuItem
              icon={Shield}
              label="Purity Standards & Lab Reports"
              description="Verify daily milk quality standard tests"
              onPress={() => router.push("/singlepage/traceability")}
              isLast={true}
            />
          </View>
        </View>

        {/* ── Section: App Support & Policy ─────────────────────────── */}
        <View style={{ marginTop: 24 }}>
          <Text style={{ fontSize: 11, fontWeight: "700", color: "#9ca3af", marginHorizontal: 20, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>
            Support & Policies
          </Text>
          <View style={{ backgroundColor: "#fff", marginHorizontal: 16, borderRadius: 20, overflow: "hidden", borderWidth: 1, borderColor: "#f5ede8" }}>
            <MenuItem
              icon={Bell}
              label="Notifications"
              description="Alert settings, updates & messages"
              onPress={() => router.push("/singlepage/notifications")}
            />
            <MenuItem
              icon={HelpCircle}
              label="Help Center & FAQs"
              description="Get answers or reach out to chat support"
              onPress={() => router.push("/singlepage/help")}
            />
            <MenuItem
              icon={BookOpen}
              label="Our Story"
              description="Discover the journey of Gaualla"
              onPress={() => router.push("/singlepage/our-story")}
            />
            <MenuItem
              icon={Info}
              label="About Us"
              description="Learn more about Gaualla family farms"
              onPress={() => router.push("/singlepage/about")}
            />
            <MenuItem
              icon={Shield}
              label="Privacy Policy"
              description="Data usage terms & safety parameters"
              onPress={() => router.push("/singlepage/Privacy")}
            />
            <MenuItem
              icon={FileText}
              label="Terms & Conditions"
              description="App service agreements & delivery clauses"
              onPress={() => router.push("/singlepage/terms")}
              isLast={true}
            />
          </View>
        </View>

        {/* ── Section: Developer Tools ─────────────────────────── */}
        {/* <View style={{ marginTop: 24 }}>
          <Text style={{ fontSize: 11, fontWeight: "700", color: "#b45309", marginHorizontal: 20, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>
            Developer & Test Tools
          </Text>
          <View style={{ backgroundColor: "#fff", marginHorizontal: 16, borderRadius: 20, overflow: "hidden", borderWidth: 1, borderColor: "#f5ede8" }}>
            <MenuItem
              icon={Clock}
              label="Trigger Midnight Scheduler"
              description="Manually run subscription evaluations & deductions"
              onPress={handleTriggerScheduler}
              isLast={true}
            />
          </View>
        </View> */}

        {/* Action Buttons: Logout & Delete */}
        <View style={{ paddingHorizontal: 16, marginTop: 32 }}>
          <TouchableOpacity
            onPress={handleLogout}
            style={{
              backgroundColor: "#3e2723",
              paddingVertical: 16,
              borderRadius: 16,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#3e2723",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.12,
              shadowRadius: 10,
              elevation: 4,
              marginBottom: 16,
            }}
            activeOpacity={0.9}
          >
            <LogOut size={18} color="#fff" style={{ marginRight: 8 }} />
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>
              LOGOUT FROM APP
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleDeleteAccount}
            style={{
              paddingVertical: 12,
              alignItems: "center",
              justifyContent: "center",
            }}
            activeOpacity={0.7}
          >
            <Text style={{ color: "#ef4444", fontSize: 13, fontWeight: "700", letterSpacing: 0.2 }}>
              Permanently Delete Account
            </Text>
          </TouchableOpacity>
        </View>

        {/* Version Display */}
        <View style={{ alignItems: "center", marginTop: 12 }}>
          <Text style={{ fontSize: 11, color: "#9ca3af", fontWeight: "600" }}>Gaualla Milk Delivery v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}