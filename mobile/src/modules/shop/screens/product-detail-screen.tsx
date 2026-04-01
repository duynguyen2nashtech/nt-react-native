// src/modules/shop/screens/product-detail-screen.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    Image,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../../../stores/store';
import {
    fetchProductById,
    clearSelectedProduct,
    selectSelectedProduct,
    selectDetailStatus,
    selectReviews,
    selectReviewStatus,
    clearReviews,
    fetchProductReviews,
    EnrichedReview,
} from '../store/shopSlice';
import { addToCartAsync } from '../../cart/store/cartSlice';
import type { ProductDetailScreenProps } from '../navigation/shop-navigator'; // ← import from navigator
import { Review } from '../../../shared/services/product-service';

const { width } = Dimensions.get('window');
 
// ─── Sub-components ───────────────────────────────────────────────────────────
const StarRow: React.FC<{ rating: number; size?: number }> = ({ rating, size = 12 }) => (
    <View style={{ flexDirection: 'row', gap: 2 }}>
        {[1, 2, 3, 4, 5].map(i => (
            <Text key={i} style={{ fontSize: size, color: i <= rating ? '#F59E0B' : '#D1D5DB' }}>
                ★
            </Text>
        ))}
    </View>
);
 
interface Feature { icon: string; label: string; value: string; }
 
const FeatureCard: React.FC<{ feature: Feature }> = ({ feature }) => (
    <View style={styles.featureCard}>
        <Text style={styles.featureIcon}>{feature.icon}</Text>
        <Text style={styles.featureLabel}>{feature.label}</Text>
        <Text style={styles.featureValue}>{feature.value}</Text>
    </View>
);
 
const formatDate = (iso: string): string => {
    try {
        const diff = Date.now() - new Date(iso).getTime();
        const days = Math.floor(diff / 86_400_000);
        if (days === 0) return 'Today';
        if (days === 1) return '1 day ago';
        if (days < 7)  return `${days} days ago`;
        if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? 's' : ''} ago`;
        return new Date(iso).toLocaleDateString();
    } catch { return iso; }
};
 
const ReviewCard: React.FC<{ review: EnrichedReview }> = ({ review }) => (
    <View style={styles.reviewCard}>
        <View style={styles.reviewHeader}>
            {review.avatar ? (
                <Image source={{ uri: review.avatar }} style={styles.avatarImage} />
            ) : (
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{review.initials}</Text>
                </View>
            )}
            <View style={{ flex: 1 }}>
                <View style={styles.reviewMeta}>
                    <Text style={styles.reviewName}>{review.resolvedName}</Text>
                    <Text style={styles.reviewDate}>{formatDate(review.createdAt)}</Text>
                </View>
                <StarRow rating={review.rating} />
            </View>
        </View>
        <Text style={styles.reviewMessage}>{review.message}</Text>
    </View>
);
 
// ─── Screen ───────────────────────────────────────────────────────────────────
const ProductDetailScreen: React.FC<ProductDetailScreenProps> = ({ navigation, route }) => {
    const { productId } = route.params;
    const dispatch = useAppDispatch();
 
    const product      = useAppSelector(selectSelectedProduct);
    const status       = useAppSelector(selectDetailStatus);
    const reviews      = useAppSelector(selectReviews);
    const reviewStatus = useAppSelector(selectReviewStatus);
 
    const [cartAdded, setCartAdded]     = useState(false);
    const [expanded, setExpanded]       = useState(false);
    const [activeSlide, setActiveSlide] = useState(0);
    const [wishlist, setWishlist]       = useState(false);
    const cartAnim = useRef(new Animated.Value(1)).current;
 
    useEffect(() => {
        dispatch(fetchProductById(productId));
        dispatch(fetchProductReviews(productId));
        return () => {
            dispatch(clearSelectedProduct());
            dispatch(clearReviews());
        };
    }, [productId, dispatch]);
 
    const handleAddToCart = () => {
        if (!product) return;
        Animated.sequence([
            Animated.timing(cartAnim, { toValue: 0.93, duration: 80, useNativeDriver: true }),
            Animated.timing(cartAnim, { toValue: 1,    duration: 80, useNativeDriver: true }),
        ]).start();
        dispatch(addToCartAsync({ product, quantity: 1 }));
        setCartAdded(true);
        setTimeout(() => setCartAdded(false), 2000);
    };
 
    // ── Loading / Error ───────────────────────────────────────────────────────
    if (status === 'loading' || status === 'idle') {
        return (
            <SafeAreaView style={styles.safe}>
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color="#00C2CB" />
                </View>
            </SafeAreaView>
        );
    }
 
    if (status === 'failed' || !product) {
        return (
            <SafeAreaView style={styles.safe}>
                <View style={styles.centered}>
                    <Text style={styles.errorText}>Product not found.</Text>
                    <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                        <Text style={styles.backBtnText}>Go back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }
 
    // Features — use product fields if available, fall back to defaults
    const features: Feature[] = [
        { icon: '🔋', label: 'Battery',  value: product.battery        ?? '48 Hours' },
        { icon: '📡', label: 'Sync',     value: product.connectivity   ?? 'Bluetooth 5.2' },
        { icon: '💧', label: 'Water',    value: product.waterResistance ?? '5ATM Resist' },
        { icon: '🛡️', label: 'Warranty', value: product.warranty        ?? '12 Months' },
    ];
 
    const images: string[]  = (product as any).images ?? [product.image];
    const isLongDesc        = product.description.length > 160;
    const descShort         = product.description.slice(0, 160);
    const avgRating         = reviews.length
        ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
        : product.rating ?? 0;
 
    return (
        <SafeAreaView style={styles.safe}>
 
            {/* ── Top bar ───────────────────────────────────────────── */}
            <View style={styles.topBar}>
                <TouchableOpacity style={styles.iconBtnDark} onPress={() => navigation.goBack()}>
                    <Text style={styles.iconBtnTextLight}>‹</Text>
                </TouchableOpacity>
                <Text style={styles.topTitle}>Product Details</Text>
                <TouchableOpacity style={styles.iconBtnDark}>
                    <Text style={styles.iconBtnTextLight}>⊞</Text>
                </TouchableOpacity>
            </View>
 
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
 
                {/* ── Image carousel ────────────────────────────────── */}
                <View style={styles.imageSection}>
                    <ScrollView
                        horizontal pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onMomentumScrollEnd={e =>
                            setActiveSlide(Math.round(e.nativeEvent.contentOffset.x / width))
                        }
                    >
                        {images.map((uri, i) => (
                            <Image key={i} source={{ uri }} style={styles.carouselImage} resizeMode="contain" />
                        ))}
                    </ScrollView>
                    <View style={styles.dotRow}>
                        {images.map((_, i) => (
                            <View key={i} style={[styles.dot, i === activeSlide && styles.dotActive]} />
                        ))}
                    </View>
                </View>
 
                {/* ── Product info ──────────────────────────────────── */}
                <View style={styles.infoSection}>
                    <View style={styles.badgeRow}>
                        <View style={styles.newBadge}>
                            <Text style={styles.newBadgeText}>{product.badge ?? 'NEW ARRIVAL'}</Text>
                        </View>
                        <TouchableOpacity onPress={() => setWishlist(w => !w)}>
                            <Text style={{ fontSize: 22, color: wishlist ? '#EF4444' : '#D1D5DB' }}>
                                {wishlist ? '♥' : '♡'}
                            </Text>
                        </TouchableOpacity>
                    </View>
 
                    <Text style={styles.productName}>{product.name}</Text>
 
                    <View style={styles.ratingRow}>
                        <StarRow rating={Math.round(avgRating)} size={14} />
                        <Text style={styles.ratingText}>
                            {avgRating > 0 ? avgRating.toFixed(1) : '—'}
                        </Text>
                        <Text style={styles.reviewCount}>
                            ({reviews.length || product.reviewCount || 0} Reviews)
                        </Text>
                    </View>
 
                    <View style={styles.priceRow}>
                        <Text style={styles.price}>${Number(product.price).toFixed(2)}</Text>
                        {product.originalPrice && (
                            <Text style={styles.originalPrice}>
                                ${Number(product.originalPrice).toFixed(2)}
                            </Text>
                        )}
                    </View>
                </View>
 
                {/* ── Key Features ──────────────────────────────────── */}
                <View style={styles.sectionBox}>
                    <Text style={styles.sectionTitle}>Key Features</Text>
                    <View style={styles.featuresGrid}>
                        {features.map(f => <FeatureCard key={f.label} feature={f} />)}
                    </View>
                </View>
 
                {/* ── Description ───────────────────────────────────── */}
                <View style={styles.sectionBox}>
                    <Text style={styles.sectionTitle}>Product Description</Text>
                    <Text style={styles.description}>
                        {expanded || !isLongDesc ? product.description : descShort + '…'}
                    </Text>
                    {isLongDesc && (
                        <TouchableOpacity onPress={() => setExpanded(e => !e)}>
                            <Text style={styles.readMore}>
                                {expanded ? 'Read less' : 'Read more...'}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
 
                {/* ── User Reviews ──────────────────────────────────── */}
                <View style={styles.sectionBox}>
                    <View style={styles.reviewsHeader}>
                        <Text style={styles.sectionTitle}>User Reviews</Text>
                        <TouchableOpacity>
                            <Text style={styles.seeAll}>See All</Text>
                        </TouchableOpacity>
                    </View>
 
                    {reviewStatus === 'loading' ? (
                        <ActivityIndicator size="small" color="#00C2CB" style={{ marginTop: 12 }} />
                    ) : reviewStatus === 'failed' ? (
                        <Text style={styles.noReviews}>Failed to load reviews.</Text>
                    ) : reviews.length === 0 ? (
                        <Text style={styles.noReviews}>No reviews yet.</Text>
                    ) : (
                        reviews.slice(0, 3).map(r => <ReviewCard key={r.id} review={r} />)
                    )}
                </View>
 
                <View style={{ height: 110 }} />
            </ScrollView>
 
            {/* ── CTA bar ───────────────────────────────────────────── */}
            <View style={styles.ctaBar}>
                <Animated.View style={{ flex: 1, transform: [{ scale: cartAnim }] }}>
                    <TouchableOpacity
                        style={[styles.cartBtn, cartAdded && styles.cartBtnAdded]}
                        onPress={handleAddToCart}
                        activeOpacity={0.85}
                    >
                        <Text style={[styles.cartBtnText, cartAdded && styles.cartBtnTextAdded]}>
                            {cartAdded ? '✓ Added!' : 'Add to Cart'}
                        </Text>
                    </TouchableOpacity>
                </Animated.View>
                <TouchableOpacity style={styles.buyBtn} activeOpacity={0.85}>
                    <Text style={styles.buyBtnText}>Buy Now</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};
 
// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    safe:      { flex: 1, backgroundColor: '#F8FAFA' },
    centered:  { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
    scroll:    { paddingBottom: 24 },
    errorText: { fontSize: 14, color: '#E53935' },
    backBtn:   { backgroundColor: '#00C2CB', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 12 },
    backBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
 
    topBar: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'android' ? 12 : 6,
        paddingBottom: 10,
        backgroundColor: '#1A1A2E',
    },
    topTitle:         { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },
    iconBtnDark:      { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.12)', justifyContent: 'center', alignItems: 'center' },
    iconBtnTextLight: { fontSize: 20, color: '#FFFFFF', lineHeight: 24 },
 
    imageSection:  { backgroundColor: '#1A1A2E', paddingBottom: 16 },
    carouselImage: { width, height: width * 0.85 },
    dotRow:        { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 4 },
    dot:           { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.3)' },
    dotActive:     { width: 18, backgroundColor: '#00C2CB' },
 
    infoSection:  { backgroundColor: '#fff', padding: 16, borderBottomWidth: 0.5, borderBottomColor: '#E5E7EB' },
    badgeRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    newBadge:     { backgroundColor: '#CCFBF1', borderRadius: 4, paddingHorizontal: 8, paddingVertical: 3 },
    newBadgeText: { fontSize: 10, fontWeight: '700', color: '#0D9488', letterSpacing: 0.6 },
    productName:  { fontSize: 18, fontWeight: '700', color: '#111827', lineHeight: 26, marginBottom: 8 },
    ratingRow:    { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
    ratingText:   { fontSize: 13, fontWeight: '600', color: '#111827' },
    reviewCount:  { fontSize: 12, color: '#9CA3AF' },
    priceRow:     { flexDirection: 'row', alignItems: 'baseline', gap: 10 },
    price:        { fontSize: 26, fontWeight: '800', color: '#111827' },
    originalPrice:{ fontSize: 15, color: '#9CA3AF', textDecorationLine: 'line-through' },
 
    sectionBox:   { backgroundColor: '#fff', marginTop: 8, padding: 16 },
    sectionTitle: { fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 14 },
 
    featuresGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    featureCard:  {
        width: (width - 52) / 2,
        backgroundColor: '#F9FAFB', borderRadius: 12,
        padding: 12, gap: 4,
        borderWidth: 0.5, borderColor: '#E5E7EB',
    },
    featureIcon:  { fontSize: 20 },
    featureLabel: { fontSize: 11, color: '#9CA3AF', marginTop: 4 },
    featureValue: { fontSize: 13, fontWeight: '600', color: '#111827' },
 
    description: { fontSize: 13.5, color: '#6B7280', lineHeight: 22 },
    readMore:    { color: '#00C2CB', fontSize: 13, marginTop: 8 },
 
    reviewsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
    seeAll:        { fontSize: 13, color: '#00C2CB', fontWeight: '600' },
    noReviews:     { fontSize: 13, color: '#9CA3AF', textAlign: 'center', paddingVertical: 12 },
    reviewCard:    { paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: '#F3F4F6' },
    reviewHeader:  { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
    avatar:        { width: 36, height: 36, borderRadius: 18, backgroundColor: '#E0F2FE', justifyContent: 'center', alignItems: 'center' },
    avatarImage:   { width: 36, height: 36, borderRadius: 18 },
    avatarText:    { fontSize: 12, fontWeight: '700', color: '#0284C7' },
    reviewMeta:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 },
    reviewName:    { fontSize: 13, fontWeight: '600', color: '#111827' },
    reviewDate:    { fontSize: 11, color: '#9CA3AF' },
    reviewMessage: { fontSize: 13, color: '#6B7280', lineHeight: 20 },
 
    ctaBar: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        flexDirection: 'row', gap: 12, paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: Platform.OS === 'ios' ? 32 : 16,
        backgroundColor: '#fff',
        borderTopWidth: 0.5, borderTopColor: '#E5E7EB',
    },
    cartBtn:          { flex: 1, paddingVertical: 14, borderRadius: 14, borderWidth: 1.5, borderColor: '#00C2CB', backgroundColor: '#fff', alignItems: 'center' },
    cartBtnAdded:     { backgroundColor: '#00C2CB' },
    cartBtnText:      { fontSize: 14, fontWeight: '700', color: '#00C2CB' },
    cartBtnTextAdded: { color: '#fff' },
    buyBtn:           {
        flex: 1, paddingVertical: 14, borderRadius: 14,
        backgroundColor: '#00C2CB', alignItems: 'center',
        shadowColor: '#00C2CB', shadowOpacity: 0.4, shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 }, elevation: 4,
    },
    buyBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
});
 
export { ProductDetailScreen };