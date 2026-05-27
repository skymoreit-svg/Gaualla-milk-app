import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useIsFocused } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Award, CheckCircle2, ChevronLeft, Droplet, Heart, Leaf, Shield, ShieldCheck, Users, Zap } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OurStory() {
  const router = useRouter();

  const player = useVideoPlayer(require('../../assets/video/Home-bg-video.mp4'), player => {
    player.loop = true;
    player.muted = true;
    player.play();
  });

  const [isMuted, setIsMuted] = useState(true);

  const toggleMute = () => {
    player.muted = !player.muted;
    setIsMuted(player.muted);
  };

  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      player.play();
    } else {
      player.pause();
    }
  }, [isFocused]);

  const farmerBenefits = [
    { icon: <Users size={24} color="#b45309" />, title: "Fair Trade & Direct Support", desc: "We pay premium prices directly to our farming partners, ensuring they receive fair compensation for their dedication and quality care." },
    { icon: <Heart size={24} color="#b45309" />, title: "Community Care", desc: "We provide healthcare, education support, and livelihood assistance to farming families, treating them as true partners in our mission." },
    { icon: <Leaf size={24} color="#b45309" />, title: "Sustainable Practices", desc: "We train farmers in organic, sustainable methods that enhance soil health and ensure long-term prosperity for their lands." },
    { icon: <Droplet size={24} color="#b45309" />, title: "Resources & Infrastructure", desc: "We invest in modern infrastructure, equipment, and water management systems to make farming easier and more profitable." }
  ];

  const cowCare = [
    { icon: <Award size={24} color="#b45309" />, title: "Heritage Breed Excellence", desc: "We exclusively work with indigenous breeds like Gir, Sahiwal, and Red Sindhi, which produce nutritionally superior A2 milk rich in beta-casein." },
    { icon: <Leaf size={24} color="#b45309" />, title: "Stress-Free Environment", desc: "Our cows are raised in spacious, open pastures with access to natural grazing, ensuring psychological well-being and superior milk quality." },
    { icon: <Heart size={24} color="#b45309" />, title: "Holistic Health Care", desc: "Regular veterinary care, vaccination programs, and 24/7 health monitoring ensure our cows live long, healthy, productive lives." },
    { icon: <Droplet size={24} color="#b45309" />, title: "Natural Nutrition", desc: "Organic, pesticide-free fodder and feed with zero antibiotics or artificial growth hormones — just natural nutrition as nature intended." },
    { icon: <Shield size={24} color="#b45309" />, title: "Ethical Treatment", desc: "We follow strict ethical guidelines ensuring humane treatment, no forced lactation, and respecting the natural lifecycle of every cow." },
    { icon: <Zap size={24} color="#b45309" />, title: "Regenerative Farming", desc: "Our farming practices actively improve soil health, sequester carbon, and support biodiversity — healing the earth with every harvest." }
  ];

  const features = [
    { icon: <Leaf size={20} color="#b45309" />, title: "Pure A2 Heritage", desc: "Sourced from indigenous cows raised with traditional care." },
    { icon: <ShieldCheck size={20} color="#b45309" />, title: "Zero Compromise", desc: "100% antibiotic-free and chemical-free purity guaranteed." },
    { icon: <Zap size={20} color="#b45309" />, title: "Farm Fresh", desc: "Delivered within 24 hours of milking for peak nutrition." },
    { icon: <Heart size={20} color="#b45309" />, title: "Ethical Farming", desc: "Our cows are treated as family in a stress-free environment." }
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Our Story</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Section 1: Journey */}
        <View style={styles.section}>
          <Text style={styles.tagline}>GAUALLA'S JOURNEY</Text>
          <Text style={styles.mainHeading}>At Gaualla, It All Begins With Care</Text>

          <Image source={require('../../assets/images/ourstory2.png')} style={styles.imageFull} resizeMode="cover" />

          <Text style={styles.paragraph}>
            Gaualla's story is rooted in tradition, passion, and a deep commitment to quality. What started as a vision to preserve the purity of indigenous cow milk has grown into a mission to transform family nutrition and wellness.
          </Text>
          <Text style={styles.paragraph}>
            We source our milk from heritage breeds raised with unconditional love and respect. Every drop carries the promise of nature's purest gift — unaltered, untainted, and brimming with life-giving nutrients.
          </Text>
          <Text style={styles.paragraph}>
            From our humble beginnings in Punjab to reaching families across the nation, Gaualla has remained steadfast in one principle: <Text style={{ fontWeight: '700', color: '#b45309' }}>quality without compromise</Text>. We believe that good food has the power to heal, strengthen, and bring joy to every household.
          </Text>

          <View style={styles.quoteBox}>
            <Text style={styles.quoteText}>
              "For us, milk isn't just a product — it's a responsibility, a legacy, and an act of love toward our families and the planet."
            </Text>
          </View>
        </View>

        {/* Section: Organic & Wholesome */}
        <View style={[styles.section, { backgroundColor: '#fff7ed', padding: 20, marginHorizontal: -16, marginBottom: 32 }]}>
          <Text style={styles.mainHeading}>We Are Proudly And Passionately Obsessed With Everything <Text style={{ color: '#b45309' }}>Organic!</Text></Text>
          <Text style={styles.paragraph}>
            In our daily routines, we often forget to take stock of what we're eating and how it affects our bodies. The choices we make about food shape not only our health but also our family's immunity and wellbeing.
          </Text>
          <Text style={styles.paragraph}>
            That's why we must consciously invest energy in finding the right kinds of foods. At Gaualla, we believe that every sip of our A2 milk is an investment in your family's health, immunity, and a better future. No antibiotics. No hormones. No compromise.
          </Text>
          <Text style={[styles.paragraph, { fontWeight: '700', color: '#1f2937' }]}>
            Just pure, organic goodness — the way nature intended.
          </Text>

          <Image source={require('../../assets/images/ourstory.png')} style={styles.imageFull} resizeMode="cover" />
        </View>

        {/* Section 2: Farmer Benefits */}
        <View style={styles.section}>
          <Text style={styles.tagline}>FARMING PARTNERS</Text>
          <Text style={styles.mainHeading}>Empowering Our Farmers</Text>
          <Text style={styles.paragraph}>
            Behind every bottle of Gaualla milk is a farmer whose dedication and care make it all possible. We're committed to their welfare and prosperity.
          </Text>

          <View style={styles.gridContainer}>
            {farmerBenefits.map((item, index) => (
              <View key={index} style={styles.cardFull}>
                <View style={styles.iconWrapper}>{item.icon}</View>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardDesc}>{item.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Section 3: Cow Care */}
        <View style={[styles.section, { backgroundColor: '#fdf8f6', paddingVertical: 24, marginHorizontal: -16, paddingHorizontal: 16 }]}>
          <Text style={styles.tagline}>ANIMAL CARE</Text>
          <Text style={styles.mainHeading}>Our Cows Are Family</Text>

          <Image source={require('../../assets/images/cows.png')} style={styles.imageFull} resizeMode="cover" />

          <Text style={styles.paragraph}>
            At Gaualla, we believe that healthy, happy cows produce superior milk. Every cow in our care receives love, respect, and the finest living conditions. They're not just dairy animals — they're part of our extended family.
          </Text>
          <Text style={styles.paragraph}>
            Their welfare directly impacts the quality and nutritional value of the milk you bring to your family's table. That's why we spare no effort in ensuring their happiness and health.
          </Text>

          <View style={styles.gridContainer}>
            {cowCare.map((item, index) => (
              <View key={index} style={styles.cardFull}>
                <View style={styles.iconWrapper}>{item.icon}</View>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardDesc}>{item.desc}</Text>
              </View>
            ))}
          </View>

          <View style={{ marginTop: 24, backgroundColor: '#fef3c7', padding: 20, borderRadius: 16, borderColor: '#fde68a', borderWidth: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#92400e', textAlign: 'center', marginBottom: 8 }}>
              ✓ Certified Humane • ✓ Organic Verified • ✓ Animal Wellness Assured
            </Text>
            <Text style={{ fontSize: 14, color: '#92400e', textAlign: 'center' }}>
              Every step of our process is audited and verified to ensure we meet and exceed international standards for animal care and welfare.
            </Text>
          </View>
        </View>

        {/* Section 4: Sustainability */}
        <View style={[styles.section, { backgroundColor: '#f0fdf4', paddingVertical: 24, marginHorizontal: -16, paddingHorizontal: 16 }]}>
          <Text style={[styles.tagline, { color: '#16a34a' }]}>SUSTAINABILITY</Text>
          <Text style={styles.mainHeading}>Nourishing People, Healing the Planet</Text>

          <Text style={styles.paragraph}>
            Gaualla products are minimally processed from consciously and sustainably sourced ingredients. We work closely with our farming families to ensure practices that regenerate rather than deplete.
          </Text>
          <Text style={styles.paragraph}>
            We believe the healthy choices we make for our bodies should also be healthy for our planet. Every decision — from packaging to production — is guided by our commitment to environmental stewardship.
          </Text>

          <View style={styles.listContainer}>
            <View style={styles.listItem}>
              <CheckCircle2 size={24} color="#16a34a" style={styles.listIcon} />
              <View style={styles.listTextContainer}>
                <Text style={styles.listTitle}>Zero Waste Practices</Text>
                <Text style={styles.listDesc}>Composting, recycling, and minimal packaging to reduce our environmental footprint.</Text>
              </View>
            </View>
            <View style={styles.listItem}>
              <CheckCircle2 size={24} color="#16a34a" style={styles.listIcon} />
              <View style={styles.listTextContainer}>
                <Text style={styles.listTitle}>Regenerative Agriculture</Text>
                <Text style={styles.listDesc}>Practices that restore soil health, increase biodiversity, and sequester carbon.</Text>
              </View>
            </View>
            <View style={styles.listItem}>
              <CheckCircle2 size={24} color="#16a34a" style={styles.listIcon} />
              <View style={styles.listTextContainer}>
                <Text style={styles.listTitle}>Water Conservation</Text>
                <Text style={styles.listDesc}>Efficient irrigation and management systems protecting this precious resource.</Text>
              </View>
            </View>
          </View>

          <Image source={require('../../assets/images/ourstory2.png')} style={[styles.imageFull, { marginTop: 24 }]} resizeMode="cover" />
        </View>

        {/* Section 5: About Gaualla */}
        <View style={[styles.section, { marginBottom: 0 }]}>
          <Text style={styles.tagline}>ABOUT GAUALLA</Text>
          <Text style={styles.mainHeading}>Bringing You the Purity of Nature.</Text>

          <Image source={require('../../assets/images/img1.webp')} style={styles.imageFull} resizeMode="contain" />

          <Text style={styles.paragraph}>
            Our journey started with a simple goal: to provide families with the same pure, unadulterated A2 milk that our grandparents enjoyed. Today, we stand as a symbol of trust, quality, and ethical farming.
          </Text>

          <View style={styles.gridContainer}>
            {features.map((item, index) => (
              <View key={index} style={styles.featureCard}>
                <View style={styles.featureIcon}>{item.icon}</View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.featureTitle}>{item.title}</Text>
                  <Text style={styles.featureDesc}>{item.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Video Section */}
        <View style={{ width: '100%', height: 420, position: 'relative', overflow: 'hidden', backgroundColor: '#3e2723', marginTop: 32 }}>
          <VideoView
            style={StyleSheet.absoluteFill}
            player={player}
            allowsFullscreen={false}
            nativeControls={false}
            contentFit="cover"
          />
          {/* Floating Mute/Unmute Icon */}
          <TouchableOpacity
            onPress={toggleMute}
            activeOpacity={0.8}
            style={{
              position: 'absolute',
              bottom: 16,
              right: 16,
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.2)',
            }}
          >
            <MaterialIcons
              name={isMuted ? "volume-off" : "volume-up"}
              size={20}
              color="#ffffff"
            />
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5ede8',
    backgroundColor: '#fff',
    shadowColor: '#3e2723',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fdf6f3',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#f0e0d8',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1f2937',
    letterSpacing: -0.5,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 32,
  },
  tagline: {
    fontSize: 12,
    fontWeight: '800',
    color: '#b45309',
    letterSpacing: 1,
    marginBottom: 8,
  },
  mainHeading: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1f2937',
    marginBottom: 16,
    lineHeight: 34,
  },
  paragraph: {
    fontSize: 16,
    color: '#4b5563',
    lineHeight: 24,
    marginBottom: 16,
  },
  imageFull: {
    width: '100%',
    height: 240,
    borderRadius: 16,
    marginBottom: 20,
  },
  quoteBox: {
    backgroundColor: '#fef3c7',
    padding: 20,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#d97706',
    marginTop: 8,
  },
  quoteText: {
    fontSize: 15,
    fontStyle: 'italic',
    color: '#92400e',
    fontWeight: '600',
    lineHeight: 24,
  },
  gridContainer: {
    flexDirection: 'column',
    gap: 12,
  },
  cardFull: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#3e2723',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f5ede8',
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#fef3c7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 8,
  },
  cardDesc: {
    fontSize: 15,
    color: '#4b5563',
    lineHeight: 22,
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: '#fdf8f6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  listContainer: {
    marginTop: 8,
    gap: 16,
  },
  listItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  listIcon: {
    marginTop: 2,
    marginRight: 16,
  },
  listTextContainer: {
    flex: 1,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 6,
  },
  listDesc: {
    fontSize: 15,
    color: '#4b5563',
    lineHeight: 22,
  },
});
