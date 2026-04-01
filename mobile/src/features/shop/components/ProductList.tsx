import React, { useState } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Dimensions,
} from 'react-native';
import { Product } from '../../../services/productService';


interface ProductListProps {
    products: Product[];
    navigation?: any;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

const ProductCard: React.FC<{ item: Product; navigation?: any }> = ({ item, navigation }) => {
    const [saved, setSaved] = useState(false);

    return (
        // ← Wrap in TouchableOpacity to navigate to detail
        <TouchableOpacity
            style={styles.card}
            activeOpacity={0.92}
            onPress={() => navigation?.navigate('ProductDetail', { productId: item.id })}
        >
            <View style={styles.imageWrap}>
                <Image
                    source={{ uri: item.image ?? 'https://via.placeholder.com/200' }}
                    style={styles.image}
                    resizeMode="cover"
                />
                <TouchableOpacity
                    style={styles.heart}
                    onPress={(e) => {
                        e.stopPropagation();
                        setSaved((s) => !s);
                    }}
                >
                    <Text style={{ fontSize: 14, color: saved ? '#E53935' : '#9CA3AF' }}>
                        {saved ? '♥' : '♡'}
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={styles.info}>
                <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
                <View style={styles.priceRow}>
                    <Text style={styles.price}>${Number(item.price).toFixed(2)}</Text>
                    <TouchableOpacity
                        style={styles.addBtn}
                        onPress={(e) => {
                            e.stopPropagation();
                            // addToCart quick action
                        }}
                    >
                        <Text style={styles.addIcon}>+</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const ProductList: React.FC<ProductListProps> = ({ products, navigation }) => {
    return (
        <FlatList
            data={products}
            keyExtractor={(item) => String(item.id)}
            numColumns={2}
            columnWrapperStyle={styles.row}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => <ProductCard item={item} navigation={navigation} />}
        />
    );
};

const styles = StyleSheet.create({
    list: { paddingBottom: 100 },
    row: { justifyContent: 'space-between', marginBottom: 14 },
    card: {
        width: CARD_WIDTH,
        backgroundColor: '#fff',
        borderRadius: 14,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
    },
    imageWrap: {
        position: 'relative',
        width: '100%',
        height: CARD_WIDTH,
        backgroundColor: '#E8F5F0',
    },
    image: { width: '100%', height: '100%' },
    heart: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: 'rgba(255,255,255,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    info: { padding: 10 },
    name: { fontSize: 13, fontWeight: '600', color: '#111827', marginBottom: 2 },
    priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    price: { fontSize: 14, fontWeight: '700', color: '#111827' },
    addBtn: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#00C2CB',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#00C2CB',
        shadowOpacity: 0.4,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
    },
    addIcon: { fontSize: 20, color: '#fff', lineHeight: 22, fontWeight: '300' },
});

export default ProductList;