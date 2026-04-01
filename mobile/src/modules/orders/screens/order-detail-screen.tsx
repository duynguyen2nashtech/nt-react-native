import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
} from 'react-native';
import { useSelector } from 'react-redux';
import { Order } from '../store/ordersSlice';
import { RootState } from '../../../reducers/root-reducer';

// ── Types ─────────────────────────────────────────────────────────────────────

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ProfileStackParamList } from '../../profile/navigation/profile-navigator';
import { Product } from '../../../shared/services/product-service';

type OrderDetailScreenProps = NativeStackScreenProps<ProfileStackParamList, 'OrderDetail'>;

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatDate = (iso: string): string => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', {
        weekday: 'short',
        month:   'long',
        day:     'numeric',
        year:    'numeric',
    });
};

const formatAmount = (n: number): string =>
    `$${n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;

const orderNumber = (id: number): string =>
    `ORD-${String(id).padStart(5, '0')}`;

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    pending:    { label: 'PENDING',    color: '#D97706', bg: '#FEF3C7' },
    processing: { label: 'PROCESSING', color: '#7C3AED', bg: '#EDE9FE' },
    shipped:    { label: 'SHIPPED',    color: '#2563EB', bg: '#DBEAFE' },
    delivered:  { label: 'DELIVERED',  color: '#059669', bg: '#D1FAE5' },
    cancelled:  { label: 'CANCELLED',  color: '#DC2626', bg: '#FEE2E2' },
};

// ── Section Card ──────────────────────────────────────────────────────────────

const SectionCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {children}
    </View>
);

// ── Info Row ──────────────────────────────────────────────────────────────────

const InfoRow: React.FC<{ label: string; value: string; valueColor?: string }> = ({
    label,
    value,
    valueColor,
}) => (
    <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={[styles.infoValue, valueColor ? { color: valueColor } : null]}>{value}</Text>
    </View>
);

// ── Order Detail Screen ───────────────────────────────────────────────────────

const OrderDetailScreen: React.FC<OrderDetailScreenProps> = ({ navigation, route }) => {
    const { order } = route.params;
    const products = useSelector((state: RootState) => state.shop.products) as Product[];
    const statusCfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG['pending'];

    // Calculate subtotal, shipping (free over $100), tax
    const subtotal  = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping  = subtotal >= 100 ? 0 : 9.99;
    const tax       = subtotal * 0.08;

    return (
        <View style={styles.container}>

            {/* ── Header ── */}
            <View style={styles.topBar}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <Text style={styles.backArrow}>{'‹'}</Text>
                </TouchableOpacity>
                <Text style={styles.topBarTitle}>Order Details</Text>
                <View style={styles.topBarRight} />
            </View>

            <ScrollView
                contentContainerStyle={styles.scroll}
                showsVerticalScrollIndicator={false}
            >

                {/* ── Order Header Card ── */}
                <View style={styles.headerCard}>
                    <View style={styles.headerTop}>
                        <View>
                            <Text style={styles.orderNum}>ORDER #{orderNumber(order.id)}</Text>
                            <Text style={styles.orderDate}>Placed on {formatDate(order.createdAt)}</Text>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
                            <Text style={[styles.statusText, { color: statusCfg.color }]}>
                                {statusCfg.label}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* ── Items ── */}
                <SectionCard title="Items Ordered">
                    {order.items.map((item, index) => {
                        const product      = products.find(p => p.id === item.productId);
                        const productName  = product?.name  ?? `Product #${item.productId}`;
                        const productImage = product?.image ?? null;
                        const isLast       = index === order.items.length - 1;

                        return (
                            <View
                                key={`${item.productId}-${index}`}
                                style={[styles.itemRow, !isLast && styles.itemRowBorder]}
                            >
                                {/* Product image */}
                                {productImage ? (
                                    <Image
                                        source={{ uri: productImage }}
                                        style={styles.itemImage}
                                        resizeMode="cover"
                                    />
                                ) : (
                                    <View style={[styles.itemImage, styles.itemImagePlaceholder]}>
                                        <Text style={{ fontSize: 20 }}>📦</Text>
                                    </View>
                                )}

                                {/* Product info */}
                                <View style={styles.itemInfo}>
                                    <Text style={styles.itemName} numberOfLines={2}>
                                        {productName}
                                    </Text>
                                    <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
                                </View>

                                {/* Price */}
                                <Text style={styles.itemPrice}>
                                    {formatAmount(item.price * item.quantity)}
                                </Text>
                            </View>
                        );
                    })}
                </SectionCard>

                {/* ── Price Breakdown ── */}
                <SectionCard title="Price Summary">
                    <InfoRow label="Subtotal"  value={formatAmount(subtotal)} />
                    <InfoRow
                        label="Shipping"
                        value={shipping === 0 ? 'FREE' : formatAmount(shipping)}
                        valueColor={shipping === 0 ? '#059669' : undefined}
                    />
                    <InfoRow label="Tax (8%)"  value={formatAmount(tax)} />
                    <View style={styles.divider} />
                    <View style={styles.infoRow}>
                        <Text style={styles.totalLabel}>Total</Text>
                        <Text style={styles.totalValue}>{formatAmount(order.totalAmount)}</Text>
                    </View>
                </SectionCard>

                {/* ── Shipping Info ── */}
                <SectionCard title="Shipping Address">
                    <View style={styles.addressRow}>
                        <Text style={styles.addressIcon}>📍</Text>
                        <Text style={styles.addressText}>{order.shippingAddress}</Text>
                    </View>
                </SectionCard>

                {/* ── Payment ── */}
                <SectionCard title="Payment Method">
                    <View style={styles.addressRow}>
                        <Text style={styles.addressIcon}>💳</Text>
                        <Text style={styles.addressText}>
                            {order.paymentMethod
                                .replace(/_/g, ' ')
                                .replace(/\b\w/g, c => c.toUpperCase())}
                        </Text>
                    </View>
                </SectionCard>

                {/* ── Dates ── */}
                <SectionCard title="Order Timeline">
                    <InfoRow label="Order Placed" value={formatDate(order.createdAt)} />
                    <InfoRow label="Last Updated"  value={formatDate(order.updatedAt)} />
                </SectionCard>

            </ScrollView>
        </View>
    );
};

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: {
        flex:            1,
        backgroundColor: '#F9FAFB',
    },
    topBar: {
        flexDirection:     'row',
        alignItems:        'center',
        justifyContent:    'space-between',
        paddingHorizontal: 16,
        paddingTop:        16,
        paddingBottom:     12,
        backgroundColor:   '#fff',
        borderBottomWidth: 0.5,
        borderBottomColor: '#E5E7EB',
    },
    backButton: {
        width:      32,
        alignItems: 'flex-start',
    },
    backArrow: {
        fontSize:   28,
        color:      '#1F2937',
        lineHeight: 30,
    },
    topBarTitle: {
        fontSize:   16,
        fontWeight: '600',
        color:      '#1F2937',
    },
    topBarRight: {
        width: 32,
    },
    scroll: {
        padding:       16,
        paddingBottom: 40,
        gap:           12,
    },

    // ── Header card ──
    headerCard: {
        backgroundColor: '#fff',
        borderRadius:    16,
        padding:         16,
        shadowColor:     '#000',
        shadowOpacity:   0.05,
        shadowRadius:    8,
        shadowOffset:    { width: 0, height: 2 },
        elevation:       3,
    },
    headerTop: {
        flexDirection:  'row',
        justifyContent: 'space-between',
        alignItems:     'flex-start',
    },
    orderNum: {
        fontSize:      13,
        fontWeight:    '700',
        color:         '#111827',
        letterSpacing: 0.3,
        marginBottom:  4,
    },
    orderDate: {
        fontSize: 12,
        color:    '#9CA3AF',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical:   4,
        borderRadius:      8,
    },
    statusText: {
        fontSize:      10,
        fontWeight:    '700',
        letterSpacing: 0.5,
    },

    // ── Section card ──
    sectionCard: {
        backgroundColor: '#fff',
        borderRadius:    16,
        padding:         16,
        shadowColor:     '#000',
        shadowOpacity:   0.05,
        shadowRadius:    8,
        shadowOffset:    { width: 0, height: 2 },
        elevation:       3,
    },
    sectionTitle: {
        fontSize:     14,
        fontWeight:   '700',
        color:        '#111827',
        marginBottom: 14,
    },

    // ── Item row ──
    itemRow: {
        flexDirection:  'row',
        alignItems:     'center',
        paddingVertical: 10,
        gap:            12,
    },
    itemRowBorder: {
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    itemImage: {
        width:        56,
        height:       56,
        borderRadius: 10,
        overflow:     'hidden',
    },
    itemImagePlaceholder: {
        backgroundColor: '#F3F4F6',
        justifyContent:  'center',
        alignItems:      'center',
    },
    itemInfo: {
        flex: 1,
        gap:  4,
    },
    itemName: {
        fontSize:   13,
        fontWeight: '600',
        color:      '#1F2937',
        lineHeight: 18,
    },
    itemQty: {
        fontSize: 12,
        color:    '#9CA3AF',
    },
    itemPrice: {
        fontSize:   14,
        fontWeight: '700',
        color:      '#111827',
    },

    // ── Info row ──
    infoRow: {
        flexDirection:  'row',
        justifyContent: 'space-between',
        alignItems:     'center',
        marginBottom:   10,
    },
    infoLabel: {
        fontSize: 13,
        color:    '#6B7280',
    },
    infoValue: {
        fontSize:   13,
        fontWeight: '600',
        color:      '#1F2937',
    },
    divider: {
        height:          1,
        backgroundColor: '#F3F4F6',
        marginVertical:  10,
    },
    totalLabel: {
        fontSize:   15,
        fontWeight: '700',
        color:      '#111827',
    },
    totalValue: {
        fontSize:   17,
        fontWeight: '800',
        color:      '#00C2CB',
    },

    // ── Address / payment ──
    addressRow: {
        flexDirection: 'row',
        gap:           10,
        alignItems:    'flex-start',
    },
    addressIcon: {
        fontSize:  16,
        marginTop: 1,
    },
    addressText: {
        flex:       1,
        fontSize:   13,
        color:      '#374151',
        lineHeight: 20,
    },
});

export { OrderDetailScreen };