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
} from '../store/shopSlice';
import { addToCartAsync } from '../../cart/store/cartSlice';
import type { ProductDetailScreenProps } from '../navigation/shop-navigator'; // ← import from navigator

const { width } = Dimensions.get('window');

// ← use ProductDetailScreenProps, not a local Props interface
const ProductDetailScreen: React.FC<ProductDetailScreenProps> = ({ navigation, route }) => {
    const { productId } = route.params;
    const dispatch = useAppDispatch();

    const product = useAppSelector(selectSelectedProduct);
    const status  = useAppSelector(selectDetailStatus);

    const [cartAdded, setCartAdded] = useState(false);
    const [expanded, setExpanded]   = useState(false);
    const cartAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        dispatch(fetchProductById(productId));
        return () => { dispatch(clearSelectedProduct()); };
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

    const isLongDesc = product.description.length > 160;
    const descShort  = product.description.slice(0, 160);

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.topBar}>
                <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
                    <Text style={styles.iconBtnText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.topTitle}>Product Details</Text>
                <View style={styles.iconBtn} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
                <View style={styles.imageWrap}>
                    <Image
                        source={{ uri: product.image }}
                        style={styles.image}
                        resizeMode="contain"
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.name}>{product.name}</Text>
                    <Text style={styles.price}>
                        ${Number(product.price).toFixed(2)}
                        <Text style={styles.priceUnit}> {product.priceUnit}</Text>
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Description</Text>
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

                <View style={{ height: 100 }} />
            </ScrollView>

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

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#F8FAFA' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
    errorText: { fontSize: 14, color: '#E53935' },
    backBtn: { backgroundColor: '#00C2CB', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 12 },
    backBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
    scroll: { paddingBottom: 24 },
    topBar: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'android' ? 12 : 6,
        paddingBottom: 10,
        backgroundColor: '#fff',
        borderBottomWidth: 0.5, borderBottomColor: '#E5E7EB',
    },
    topTitle: { fontSize: 15, fontWeight: '600', color: '#111827' },
    iconBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
    iconBtnText: { fontSize: 18, color: '#374151', lineHeight: 22 },
    imageWrap: {
        backgroundColor: '#fff', paddingVertical: 24, paddingHorizontal: 16,
        alignItems: 'center', borderBottomWidth: 0.5, borderBottomColor: '#E5E7EB',
    },
    image: { width: width - 64, height: width - 64, borderRadius: 12 },
    section: { paddingHorizontal: 16, paddingTop: 20 },
    sectionTitle: { fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 8 },
    name: { fontSize: 16, fontWeight: '700', color: '#111827', lineHeight: 24 },
    price: { fontSize: 24, fontWeight: '800', color: '#111827', marginTop: 10 },
    priceUnit: { fontSize: 13, fontWeight: '400', color: '#9CA3AF' },
    description: { fontSize: 13.5, color: '#6B7280', lineHeight: 22 },
    readMore: { color: '#00C2CB', fontSize: 13, marginTop: 6 },
    ctaBar: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        flexDirection: 'row', gap: 12, paddingHorizontal: 16,
        paddingTop: 12, paddingBottom: Platform.OS === 'ios' ? 32 : 16,
        backgroundColor: '#fff', borderTopWidth: 0.5, borderTopColor: '#E5E7EB',
    },
    cartBtn: {
        flex: 1, paddingVertical: 14, borderRadius: 14,
        borderWidth: 1.5, borderColor: '#00C2CB', backgroundColor: '#fff', alignItems: 'center',
    },
    cartBtnAdded: { backgroundColor: '#00C2CB' },
    cartBtnText: { fontSize: 14, fontWeight: '700', color: '#00C2CB' },
    cartBtnTextAdded: { color: '#fff' },
    buyBtn: {
        flex: 1, paddingVertical: 14, borderRadius: 14, backgroundColor: '#00C2CB', alignItems: 'center',
        shadowColor: '#00C2CB', shadowOpacity: 0.4, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 4,
    },
    buyBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
});

export { ProductDetailScreen };