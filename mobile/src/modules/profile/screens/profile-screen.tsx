import React, { useEffect, useState } from 'react';
import {
    Text,
    View,
    ActivityIndicator,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
} from 'react-native';
import { UserService, ProfileData } from '../services/user-service';
import { useAuth } from '../../auth/context/auth-context';

interface ProfileScreenProps {
    navigation: any;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
    const { signOut } = useAuth();
    const [profile, setProfile]   = useState<ProfileData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError]         = useState<string | null>(null);

    useEffect(() => {
        UserService.getProfile()
            .then(setProfile)
            .catch(() => setError('Something went wrong'))
            .finally(() => setIsLoading(false));
    }, []);

    if (isLoading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator testID="activity-indicator" size="large" color="#00C2CB" />
            </View>
        );
    }

    if (error || !profile) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>{error ?? 'No profile data'}</Text>
            </View>
        );
    }

    const initials = `${profile.firstName?.[0] ?? ''}${profile.lastName?.[0] ?? ''}`.toUpperCase();

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
                <Text style={styles.topBarTitle}>Profile Settings</Text>
                <TouchableOpacity style={styles.settingsButton}>
                    <Text style={styles.settingsIcon}>⚙</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={styles.scroll}
                showsVerticalScrollIndicator={false}
            >

                {/* ── Avatar Card ── */}
                <View style={styles.avatarCard}>
                    <View style={styles.avatarWrapper}>
                        {/* Figma uses a real avatar image — fallback to initials */}
                        <View style={styles.avatarCircle}>
                            <Text style={styles.avatarInitials}>{initials}</Text>
                        </View>
                        <TouchableOpacity style={styles.editBadge}>
                            <Text style={styles.editBadgeIcon}>✎</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Name */}
                    <Text style={styles.fullName}>
                        {profile.firstName} {profile.lastName}
                    </Text>

                    {/* Username — Figma shows @johndoe_official style */}
                    <Text style={styles.username}>@{profile.username}</Text>

                    {/* Role badge — Figma shows teal "PREMIUM MEMBER" pill */}
                    <View style={styles.roleBadge}>
                        <Text style={styles.roleBadgeText}>
                            {profile.role?.toUpperCase() ?? 'MEMBER'}
                        </Text>
                    </View>
                </View>

                {/* ── Account Details Card ── */}
                <View style={styles.sectionCard}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Account Details</Text>
                        <TouchableOpacity>
                            <Text style={styles.editDetails}>Edit Details</Text>
                        </TouchableOpacity>
                    </View>

                    <FieldRow label="EMAIL ADDRESS" value={profile.email} />
                    <FieldRow label="FIRST NAME"    value={profile.firstName} />
                    <FieldRow label="LAST NAME"     value={profile.lastName} />
                    <FieldRow label="AGE"           value={String(profile.age)} last />
                </View>

                {/* ── Order History Row ── */}
                {/* Figma shows lock icon + "Order History" with chevron */}
                <TouchableOpacity
                    style={styles.menuCard}
                    onPress={() => navigation.navigate('OrderHistory')}
                >
                    <View style={styles.menuLeft}>
                        <View style={[styles.menuIconBox, { backgroundColor: '#EEF2FF' }]}>
                            <Text style={styles.menuIcon}>🔒</Text>
                        </View>
                        <Text style={styles.menuLabel}>Order History</Text>
                    </View>
                    <Text style={styles.chevron}>›</Text>
                </TouchableOpacity>

                {/* ── Logout Row ── */}
                {/* Figma shows red icon + red "Logout" text, no chevron */}
                <TouchableOpacity
                    testID="logout-button"
                    style={styles.menuCard}
                    onPress={async () => await signOut()}
                >
                    <View style={styles.menuLeft}>
                        <View style={[styles.menuIconBox, { backgroundColor: '#FEF2F2' }]}>
                            {/* Figma uses a door/exit icon in red */}
                            <Text style={[styles.menuIcon, { color: '#E53935' }]}>🚪</Text>
                        </View>
                        <Text style={[styles.menuLabel, { color: '#E53935' }]}>Logout</Text>
                    </View>
                    {/* No chevron on logout — matches Figma */}
                </TouchableOpacity>

            </ScrollView>
        </View>
    );
};

/* ── Field Row Helper ── */
const FieldRow = ({
    label,
    value,
    last = false,
}: {
    label: string;
    value: string;
    last?: boolean;
}) => (
    <View style={[fieldStyles.wrapper, last && { marginBottom: 4 }]}>
        <Text style={fieldStyles.label}>{label}</Text>
        <View style={fieldStyles.valueBox}>
            <Text style={fieldStyles.value}>{value}</Text>
        </View>
    </View>
);

const fieldStyles = StyleSheet.create({
    wrapper: {
        marginBottom: 12,
    },
    label: {
        fontSize: 10,
        color:       '#9CA3AF',
        letterSpacing: 0.8,
        marginBottom:  4,
        fontWeight:   '500',
    },
    valueBox: {
        borderWidth:      1,
        borderColor:      '#E5E7EB',
        borderRadius:     8,
        paddingHorizontal: 14,
        paddingVertical:   11,
        backgroundColor:  '#FAFAFA',
    },
    value: {
        fontSize: 14,
        color:    '#1F2937',
    },
});

const styles = StyleSheet.create({
    container: {
        flex:            1,
        backgroundColor: '#F9FAFB', // Figma bg is slightly off-white
    },
    centered: {
        flex:            1,
        justifyContent:  'center',
        alignItems:      'center',
        backgroundColor: '#F9FAFB',
    },
    errorText: {
        fontSize: 14,
        color:    '#E53935',
    },

    /* ── Top bar ── */
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
    settingsButton: {
        width:      32,
        alignItems: 'flex-end',
    },
    settingsIcon: {
        fontSize: 18,
        color:    '#6B7280',
    },

    scroll: {
        padding:       16,
        paddingBottom: 32,
    },

    /* ── Avatar card ── */
    avatarCard: {
        backgroundColor: '#fff',
        borderRadius:    16,
        alignItems:      'center',
        paddingTop:      28,
        paddingBottom:   24,
        marginBottom:    12,
        shadowColor:     '#000',
        shadowOpacity:   0.04,
        shadowRadius:    8,
        shadowOffset:    { width: 0, height: 2 },
        elevation:       2,
    },
    avatarWrapper: {
        position:     'relative',
        marginBottom: 12,
    },
    avatarCircle: {
        width:           84,
        height:          84,
        borderRadius:    42,
        // Figma uses a warm peach/skin-tone background for the avatar
        backgroundColor: '#F3C9A8',
        justifyContent:  'center',
        alignItems:      'center',
        borderWidth:     3,
        borderColor:     '#fff',
        shadowColor:     '#000',
        shadowOpacity:   0.08,
        shadowRadius:    6,
        shadowOffset:    { width: 0, height: 2 },
        elevation:       3,
    },
    avatarInitials: {
        fontSize:   28,
        fontWeight: '600',
        color:      '#92400E', // warm brown to contrast peach bg
    },
    editBadge: {
        position:        'absolute',
        bottom:          0,
        right:           0,
        width:           26,
        height:          26,
        borderRadius:    13,
        backgroundColor: '#00C2CB',
        justifyContent:  'center',
        alignItems:      'center',
        borderWidth:     2,
        borderColor:     '#fff',
    },
    editBadgeIcon: {
        fontSize: 12,
        color:    '#fff',
    },
    fullName: {
        fontSize:     18,
        fontWeight:   '700',
        color:        '#111827',
        marginBottom: 2,
    },
    username: {
        fontSize:     13,
        color:        '#9CA3AF',
        marginBottom: 10,
    },

    // Figma: teal outlined pill "PREMIUM MEMBER"
    roleBadge: {
        paddingHorizontal: 14,
        paddingVertical:   4,
        backgroundColor:   '#CCFBF1',
        borderRadius:      20,
        borderWidth:       1,
        borderColor:       '#2DD4BF',
    },
    roleBadgeText: {
        fontSize:      10,
        fontWeight:    '700',
        color:         '#0F766E',
        letterSpacing: 1,
    },

    /* ── Section card ── */
    sectionCard: {
        backgroundColor: '#fff',
        borderRadius:    16,
        padding:         16,
        marginBottom:    12,
        shadowColor:     '#000',
        shadowOpacity:   0.04,
        shadowRadius:    8,
        shadowOffset:    { width: 0, height: 2 },
        elevation:       2,
    },
    sectionHeader: {
        flexDirection:  'row',
        justifyContent: 'space-between',
        alignItems:     'center',
        marginBottom:   16,
    },
    sectionTitle: {
        fontSize:   15,
        fontWeight: '700',
        color:      '#111827',
    },
    editDetails: {
        fontSize:   13,
        color:      '#00C2CB',
        fontWeight: '600',
    },

    /* ── Menu rows ── */
    menuCard: {
        backgroundColor:   '#fff',
        borderRadius:      16,
        paddingHorizontal: 16,
        paddingVertical:   14,
        flexDirection:     'row',
        alignItems:        'center',
        justifyContent:    'space-between',
        marginBottom:      10,
        shadowColor:       '#000',
        shadowOpacity:     0.04,
        shadowRadius:      8,
        shadowOffset:      { width: 0, height: 2 },
        elevation:         2,
    },
    menuLeft: {
        flexDirection: 'row',
        alignItems:    'center',
        gap:           12,
    },
    menuIconBox: {
        width:          38,
        height:         38,
        borderRadius:   10,
        justifyContent: 'center',
        alignItems:     'center',
    },
    menuIcon: {
        fontSize: 18,
    },
    menuLabel: {
        fontSize:   14,
        fontWeight: '500',
        color:      '#1F2937',
    },
    chevron: {
        fontSize:   22,
        color:      '#9CA3AF',
        lineHeight: 24,
    },
});

export { ProfileScreen };