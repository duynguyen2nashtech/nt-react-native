import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Image,
    ScrollView,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders, Order, OrderStatus } from '../store/ordersSlice';
import { Product } from '../../../shared/services/product-service';
import { AppDispatch } from '../../../stores/store';
import { RootState } from '../../../reducers/root-reducer';


// ── Tab config ────────────────────────────────────────────────────────────────

type TabKey = 'all' | 'ongoing' | 'completed' | 'cancelled';

const TABS: { key: TabKey; label: string }[] = [
    { key: 'all',       label: 'All Orders' },
    { key: 'ongoing',   label: 'Ongoing'    },
    { key: 'completed', label: 'Completed'  },
    { key: 'cancelled', label: 'Cancelled'  },
];

// Maps each tab to the status values it should show
const TAB_STATUS_MAP: Record<TabKey, OrderStatus[] | null> = {
    all:       null,
    ongoing:   ['pending', 'processing', 'shipped'],
    completed: ['delivered'],
    cancelled: ['cancelled'],
};

// ── Status badge config ───────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    pending:    { label: 'PENDING',    color: '#D97706', bg: '#FEF3C7' },
    processing: { label: 'PROCESSING', color: '#7C3AED', bg: '#EDE9FE' },
    shipped:    { label: 'SHIPPED',    color: '#2563EB', bg: '#DBEAFE' },
    delivered:  { label: 'DELIVERED',  color: '#059669', bg: '#D1FAE5' },
    cancelled:  { label: 'CANCELLED',  color: '#DC2626', bg: '#FEE2E2' },
};

// ── Fallback placeholder colors ───────────────────────────────────────────────
const PLACEHOLDER_COLORS = ['#F3C9A8', '#C7D9F3', '#C9F3D4', '#F3C9E8', '#F3EAC9'];

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatDate = (iso: string): string => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatAmount = (n: number): string =>
    `$${n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;

const orderNumber = (id: number): string =>
    `ORD-${String(id).padStart(5, '0')}`;

// ── Action buttons per status ─────────────────────────────────────────────────

interface ActionButtonsProps {
    status:  string;
    onPress: (action: string) => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ status, onPress }) => {
    switch (status) {
        case 'delivered':
            return (
                <View style={cardStyles.actions}>
                    <TouchableOpacity
                        style={[cardStyles.btn, cardStyles.btnOutline]}
                        onPress={() => onPress('reorder')}
                    >
                        <Text style={cardStyles.btnOutlineText}>Reorder</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[cardStyles.btn, cardStyles.btnOutline]}
                        onPress={() => onPress('view')}
                    >
                        <Text style={cardStyles.btnOutlineText}>View Details</Text>
                    </TouchableOpacity>
                </View>
            );
        case 'pending':
        case 'processing':
        case 'shipped':
            return (
                <View style={cardStyles.actions}>
                    <TouchableOpacity
                        style={[cardStyles.btn, cardStyles.btnPrimary, { flex: 1 }]}
                        onPress={() => onPress('track')}
                    >
                        <Text style={cardStyles.btnPrimaryText}>📦  Track Order</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={cardStyles.moreBtn}
                        onPress={() => onPress('more')}
                    >
                        <Text style={cardStyles.moreBtnText}>•••</Text>
                    </TouchableOpacity>
                </View>
            );
        case 'cancelled':
            return (
                <View style={cardStyles.actions}>
                    <TouchableOpacity
                        style={[cardStyles.btn, cardStyles.btnOutline]}
                        onPress={() => onPress('review')}
                    >
                        <Text style={cardStyles.btnOutlineText}>Leave Review</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[cardStyles.btn, cardStyles.btnOutline]}
                        onPress={() => onPress('buyagain')}
                    >
                        <Text style={cardStyles.btnOutlineText}>Buy Again</Text>
                    </TouchableOpacity>
                </View>
            );
        default:
            return null;
    }
};

// ── Order Card ────────────────────────────────────────────────────────────────

interface OrderCardProps {
    order:      Order;
    products:   Product[];
    navigation: any;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, products, navigation }) => {
    const statusCfg        = STATUS_CONFIG[order.status] ?? STATUS_CONFIG['pending'];
    const placeholderColor = PLACEHOLDER_COLORS[order.id % PLACEHOLDER_COLORS.length];

    // Look up first item's image from already-loaded shop Redux state
    const firstProductId = order.items[0]?.productId;
    const productImage   = products.find(p => p.id === firstProductId)?.image ?? null;

    const dateLabel = (() => {
        switch (order.status) {
            case 'delivered':
                return `Delivered on ${formatDate(order.updatedAt)}`;
            case 'shipped':
                return `Expected by ${formatDate(order.updatedAt)}`;
            case 'cancelled':
                return `Cancelled on ${formatDate(order.updatedAt)}`;
            default:
                return `Placed on ${formatDate(order.createdAt)}`;
        }
    })();

    return (
        <View style={cardStyles.card}>

            {/* ── Top row ── */}
            <View style={cardStyles.topRow}>
                <View style={cardStyles.topLeft}>
                    <Text style={cardStyles.orderNum}>ORDER #{orderNumber(order.id)}</Text>
                    <View style={[cardStyles.statusBadge, { backgroundColor: statusCfg.bg }]}>
                        <Text style={[cardStyles.statusText, { color: statusCfg.color }]}>
                            {statusCfg.label}
                        </Text>
                    </View>
                </View>

                {/* Real product image from shop state, fallback to placeholder */}
                {productImage ? (
                    <Image
                        source={{ uri: productImage }}
                        style={cardStyles.productThumb}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={[cardStyles.productThumb, { backgroundColor: placeholderColor, justifyContent: 'center', alignItems: 'center' }]}>
                        <Text style={cardStyles.productEmoji}>
                            {order.items.length > 0 ? '🛍' : '📦'}
                        </Text>
                    </View>
                )}
            </View>

            {/* ── Amount & date ── */}
            <Text style={cardStyles.amount}>{formatAmount(order.totalAmount)}</Text>
            <Text style={cardStyles.date}>{dateLabel}</Text>

            {/* ── Divider ── */}
            <View style={cardStyles.divider} />

            {/* ── Action buttons ── */}
            <ActionButtons
                status={order.status}
                onPress={(action) => {
                    if (action === 'view') {
                        navigation.navigate('OrderDetail', { order });
                    } else {
                        console.log(`[OrderCard] action="${action}" orderId=${order.id}`);
                    }
                }}
            />

        </View>
    );
};

// ── Empty State ───────────────────────────────────────────────────────────────

const EmptyState: React.FC<{ tab: TabKey }> = ({ tab }) => (
    <View style={styles.emptyWrapper}>
        <Text style={styles.emptyEmoji}>🛒</Text>
        <Text style={styles.emptyTitle}>No {tab === 'all' ? '' : tab} orders</Text>
        <Text style={styles.emptySubtitle}>
            {tab === 'all'
                ? "You haven't placed any orders yet."
                : `You have no ${tab} orders right now.`}
        </Text>
    </View>
);

// ── Main Screen ───────────────────────────────────────────────────────────────

interface OrderHistoryScreenProps {
    navigation: any;
}

const OrderHistoryScreen: React.FC<OrderHistoryScreenProps> = ({ navigation }) => {
    const dispatch = useDispatch<AppDispatch>();

    const { orders, isLoading, error } = useSelector((state: RootState) => state.orders);

    // Pull already-loaded products from shop state — zero extra API calls
    const products = useSelector((state: RootState) => state.shop.products);

    const [activeTab,    setActiveTab]    = useState<TabKey>('all');
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        dispatch(fetchOrders());
    }, [dispatch]);

    const onRefresh = useCallback(async () => {
        setIsRefreshing(true);
        await dispatch(fetchOrders());
        setIsRefreshing(false);
    }, [dispatch]);

    // Filter orders by active tab
    const filteredOrders: Order[] = (() => {
        const statuses = TAB_STATUS_MAP[activeTab];
        if (!statuses) return orders;
        return orders.filter((o: Order) => statuses.includes(o.status as OrderStatus));
    })();

    return (
        <View style={styles.container}>

            {/* ── Header ── */}
            <View style={styles.topBar}>
                <TouchableOpacity
                    testID="back-button"
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <Text style={styles.backArrow}>{'‹'}</Text>
                </TouchableOpacity>
                <Text style={styles.topBarTitle}>Order History</Text>
                <TouchableOpacity style={styles.searchButton}>
                    <Text style={styles.searchIcon}>🔍</Text>
                </TouchableOpacity>
            </View>

            {/* ── Tabs ── */}
            <View style={styles.tabsWrapper}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.tabsScroll}
                >
                    {TABS.map(tab => {
                        const isActive = tab.key === activeTab;
                        return (
                            <TouchableOpacity
                                key={tab.key}
                                testID={`tab-${tab.key}`}
                                onPress={() => setActiveTab(tab.key)}
                                style={[styles.tab, isActive && styles.tabActive]}
                            >
                                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                                    {tab.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            {/* ── Content ── */}
            {isLoading && !isRefreshing ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color="#00C2CB" testID="loading-indicator" />
                </View>
            ) : error ? (
                <View style={styles.centered}>
                    <Text style={styles.errorEmoji}>⚠️</Text>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity style={styles.retryBtn} onPress={() => dispatch(fetchOrders())}>
                        <Text style={styles.retryText}>Try Again</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={filteredOrders}
                    keyExtractor={item => String(item.id)}
                    renderItem={({ item }) => (
                        <OrderCard
                            order={item}
                            products={products}
                            navigation={navigation}
                        />
                    )}
                    contentContainerStyle={[
                        styles.listContent,
                        filteredOrders.length === 0 && styles.listEmpty,
                    ]}
                    ListEmptyComponent={<EmptyState tab={activeTab} />}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefreshing}
                            onRefresh={onRefresh}
                            colors={['#00C2CB']}
                            tintColor="#00C2CB"
                        />
                    }
                />
            )}
        </View>
    );
};

// ── Card Styles ───────────────────────────────────────────────────────────────

const cardStyles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius:    16,
        padding:         16,
        marginBottom:    12,
        shadowColor:     '#000',
        shadowOpacity:   0.05,
        shadowRadius:    8,
        shadowOffset:    { width: 0, height: 2 },
        elevation:       3,
    },
    topRow: {
        flexDirection:  'row',
        justifyContent: 'space-between',
        alignItems:     'flex-start',
        marginBottom:   8,
    },
    topLeft: {
        flex:          1,
        flexDirection: 'column',
        gap:           6,
    },
    orderNum: {
        fontSize:      11,
        fontWeight:    '600',
        color:         '#6B7280',
        letterSpacing: 0.5,
    },
    statusBadge: {
        alignSelf:         'flex-start',
        paddingHorizontal: 8,
        paddingVertical:   3,
        borderRadius:      6,
    },
    statusText: {
        fontSize:      10,
        fontWeight:    '700',
        letterSpacing: 0.5,
    },
    productThumb: {
        width:        56,
        height:       56,
        borderRadius: 10,
        marginLeft:   12,
        overflow:     'hidden',
    },
    productEmoji: {
        fontSize: 24,
    },
    amount: {
        fontSize:     20,
        fontWeight:   '700',
        color:        '#111827',
        marginBottom: 2,
    },
    date: {
        fontSize:     12,
        color:        '#9CA3AF',
        marginBottom: 14,
    },
    divider: {
        height:          1,
        backgroundColor: '#F3F4F6',
        marginBottom:    12,
    },
    actions: {
        flexDirection: 'row',
        gap:           10,
    },
    btn: {
        flex:            1,
        paddingVertical: 10,
        borderRadius:    10,
        alignItems:      'center',
        justifyContent:  'center',
    },
    btnPrimary: {
        backgroundColor: '#00C2CB',
    },
    btnPrimaryText: {
        color:      '#fff',
        fontWeight: '700',
        fontSize:   14,
    },
    btnOutline: {
        borderWidth:     1,
        borderColor:     '#E5E7EB',
        backgroundColor: '#FAFAFA',
    },
    btnOutlineText: {
        color:      '#374151',
        fontWeight: '600',
        fontSize:   13,
    },
    moreBtn: {
        width:           40,
        height:          40,
        borderRadius:    10,
        borderWidth:     1,
        borderColor:     '#E5E7EB',
        justifyContent:  'center',
        alignItems:      'center',
        backgroundColor: '#FAFAFA',
    },
    moreBtnText: {
        color:         '#6B7280',
        fontSize:      13,
        fontWeight:    '700',
        letterSpacing: 1,
    },
});

// ── Screen Styles ─────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: {
        flex:            1,
        backgroundColor: '#F9FAFB',
    },
    centered: {
        flex:           1,
        justifyContent: 'center',
        alignItems:     'center',
        gap:            12,
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
    searchButton: {
        width:      32,
        alignItems: 'flex-end',
    },
    searchIcon: {
        fontSize: 16,
    },
    tabsWrapper: {
        backgroundColor:   '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    tabsScroll: {
        paddingHorizontal: 12,
        paddingVertical:   0,
    },
    tab: {
        paddingHorizontal: 14,
        paddingVertical:   12,
        marginRight:       4,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    tabActive: {
        borderBottomColor: '#00C2CB',
    },
    tabText: {
        fontSize:   13,
        fontWeight: '500',
        color:      '#9CA3AF',
    },
    tabTextActive: {
        color:      '#00C2CB',
        fontWeight: '700',
    },
    listContent: {
        padding:       16,
        paddingBottom: 32,
    },
    listEmpty: {
        flex:           1,
        justifyContent: 'center',
    },
    emptyWrapper: {
        alignItems: 'center',
        paddingTop: 60,
        gap:        8,
    },
    emptyEmoji: {
        fontSize:     48,
        marginBottom: 8,
    },
    emptyTitle: {
        fontSize:      16,
        fontWeight:    '700',
        color:         '#374151',
        textTransform: 'capitalize',
    },
    emptySubtitle: {
        fontSize:  13,
        color:     '#9CA3AF',
        textAlign: 'center',
    },
    errorEmoji: {
        fontSize: 36,
    },
    errorText: {
        fontSize:          14,
        color:             '#EF4444',
        textAlign:         'center',
        paddingHorizontal: 32,
    },
    retryBtn: {
        marginTop:         4,
        paddingHorizontal: 24,
        paddingVertical:   10,
        backgroundColor:   '#00C2CB',
        borderRadius:      20,
    },
    retryText: {
        color:      '#fff',
        fontWeight: '700',
        fontSize:   14,
    },
});

export { OrderHistoryScreen };