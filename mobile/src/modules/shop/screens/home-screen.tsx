// src/modules/shop/screens/home-screen.tsx
import React, { useEffect } from 'react';
import {
    ActivityIndicator,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../../../stores/store';
import {
    fetchProducts,
    setSearch,
    selectFilteredProducts,
    selectListStatus,
    selectShopError,
    selectSearch,
} from '../store/shopSlice';
// import { selectUser } from '../../auth/store/authSlice';
import ProductList from '../components/ProductList';
import type { HomeScreenProps } from '../navigation/shop-navigator';
import { useAuth } from '../../auth/context/auth-context';

// Use NativeStackScreenProps from the navigator — fixes the TS error
const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
    const dispatch = useAppDispatch();

    const { user } = useAuth();  
    const products = useAppSelector(selectFilteredProducts);
    const status = useAppSelector(selectListStatus);
    const error = useAppSelector(selectShopError);
    const search = useAppSelector(selectSearch);

    useEffect(() => {
        if (user && status === 'idle') {
            dispatch(fetchProducts());
        }
    }, [user, status, dispatch]);

    if (!user) {
        return (
            <SafeAreaView style={styles.safe}>
                <View style={styles.centered}>
                    <Text style={styles.guestTitle}>Welcome Guest</Text>
                    <Text style={styles.guestSub}>Sign in to explore products</Text>
                    <TouchableOpacity
                        style={styles.loginBtn}
                        onPress={() => navigation.getParent()?.navigate('SignIn')}
                    >
                        <Text style={styles.loginBtnText}>Sign In</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    if (status === 'loading') {
        return (
            <SafeAreaView style={styles.safe}>
                <View style={styles.centered}>
                    <ActivityIndicator testID="activity-indicator" size="large" color="#00C2CB" />
                </View>
            </SafeAreaView>
        );
    }

    if (status === 'failed') {
        return (
            <SafeAreaView style={styles.safe}>
                <View style={styles.centered}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity onPress={() => dispatch(fetchProducts())}>
                        <Text style={{ color: '#00C2CB', marginTop: 8 }}>Retry</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.container}>
                <View style={styles.topBar}>
                    <Text style={styles.screenTitle}>Discover</Text>
                    <View style={styles.topIcons}>
                        <TouchableOpacity style={styles.iconBtn}>
                            <Text style={styles.iconText}>🔔</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconBtn}>
                            <Text style={styles.iconText}>🛒</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.searchWrap}>
                    <Text style={styles.searchIcon}>🔍</Text>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search products..."
                        placeholderTextColor="#9CA3AF"
                        value={search}
                        onChangeText={(text) => dispatch(setSearch(text))}
                    />
                </View>

                <View style={styles.listWrap}>
                    <ProductList products={products} navigation={navigation} />
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#F8FAFA' },
    container: { flex: 1, paddingHorizontal: 16 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10 },
    guestTitle: { fontSize: 20, fontWeight: '700', color: '#111827' },
    guestSub: { fontSize: 13, color: '#9CA3AF', marginBottom: 8 },
    loginBtn: { backgroundColor: '#00C2CB', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 14 },
    loginBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
    errorText: { color: '#E53935', fontSize: 14 },
    topBar: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingTop: Platform.OS === 'android' ? 16 : 8, paddingBottom: 12,
    },
    screenTitle: { fontSize: 22, fontWeight: '800', color: '#111827' },
    topIcons: { flexDirection: 'row', gap: 8 },
    iconBtn: {
        width: 38, height: 38, borderRadius: 19, backgroundColor: '#fff',
        justifyContent: 'center', alignItems: 'center',
        shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4,
        shadowOffset: { width: 0, height: 1 }, elevation: 2,
    },
    iconText: { fontSize: 16 },
    searchWrap: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
        borderRadius: 12, paddingHorizontal: 12,
        paddingVertical: Platform.OS === 'ios' ? 11 : 8, marginBottom: 14,
        shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4,
        shadowOffset: { width: 0, height: 1 }, elevation: 2,
    },
    searchIcon: { fontSize: 15, marginRight: 8, color: '#9CA3AF' },
    searchInput: { flex: 1, fontSize: 13, color: '#111827', padding: 0 },
    listWrap: { flex: 1 },
});

export { HomeScreen };