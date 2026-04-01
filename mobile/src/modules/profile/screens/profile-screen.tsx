import React, { useEffect, useState } from 'react';
import {
    Text,
    View,
    ActivityIndicator,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Modal,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
    Alert,
} from 'react-native';
import { UserService, ProfileData } from '../services/user-service';
// import { useAuth } from '../../auth/context/auth-context';
import { logout } from '../../auth/store/authSlice';
import { useAppDispatch } from '../../../stores/store';

interface ProfileScreenProps {
    navigation: any;
}

// ── Edit Details Payload ──────────────────────────────────────────────────────
interface EditProfilePayload {
    firstName: string;
    lastName:  string;
    age:       number;
}

// ── Edit Details Modal ────────────────────────────────────────────────────────
interface EditDetailsModalProps {
    visible:   boolean;
    profile:   ProfileData;
    onClose:   () => void;
    onSaved:   (updated: EditProfilePayload) => void;
}

const EditDetailsModal: React.FC<EditDetailsModalProps> = ({
    visible,
    profile,
    onClose,
    onSaved,
}) => {
    const [firstName, setFirstName] = useState(profile.firstName ?? '');
    const [lastName,  setLastName]  = useState(profile.lastName  ?? '');
    const [age,       setAge]       = useState(String(profile.age ?? ''));
    const [isSaving,  setIsSaving]  = useState(false);
    const [errors,    setErrors]    = useState<Partial<Record<'firstName' | 'lastName' | 'age', string>>>({});

    // Sync fields when modal opens with fresh profile data
    useEffect(() => {
        if (visible) {
            setFirstName(profile.firstName ?? '');
            setLastName(profile.lastName   ?? '');
            setAge(String(profile.age      ?? ''));
            setErrors({});
        }
    }, [visible, profile]);

    const validate = (): boolean => {
        const newErrors: typeof errors = {};
        if (!firstName.trim()) newErrors.firstName = 'First name is required';
        if (!lastName.trim())  newErrors.lastName  = 'Last name is required';
        const parsedAge = Number(age);
        if (!age.trim() || isNaN(parsedAge) || parsedAge <= 0 || !Number.isInteger(parsedAge)) {
            newErrors.age = 'Enter a valid age';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) return;

        setIsSaving(true);
        try {
            const payload: EditProfilePayload = {
                firstName: firstName.trim(),
                lastName:  lastName.trim(),
                age:       Number(age),
            };

            // PATCH /user
            await UserService.updateProfile(payload);

            onSaved(payload);
            onClose();
        } catch (err) {
            Alert.alert('Update Failed', 'Could not save your changes. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={modalStyles.overlay}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={modalStyles.sheet}
                    >
                        {/* Handle */}
                        <View style={modalStyles.handle} />

                        {/* Header */}
                        <View style={modalStyles.header}>
                            <TouchableOpacity onPress={onClose} style={modalStyles.cancelBtn}>
                                <Text style={modalStyles.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <Text style={modalStyles.title}>Edit Details</Text>
                            <TouchableOpacity
                                onPress={handleSave}
                                disabled={isSaving}
                                style={[modalStyles.saveBtn, isSaving && modalStyles.saveBtnDisabled]}
                            >
                                {isSaving
                                    ? <ActivityIndicator size="small" color="#fff" />
                                    : <Text style={modalStyles.saveText}>Save</Text>
                                }
                            </TouchableOpacity>
                        </View>

                        <ScrollView
                            contentContainerStyle={modalStyles.body}
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}
                        >
                            {/* First Name */}
                            <EditField
                                label="FIRST NAME"
                                value={firstName}
                                onChangeText={(t) => {
                                    setFirstName(t);
                                    if (errors.firstName) setErrors(prev => ({ ...prev, firstName: undefined }));
                                }}
                                placeholder="Enter first name"
                                error={errors.firstName}
                                testID="input-firstName"
                            />

                            {/* Last Name */}
                            <EditField
                                label="LAST NAME"
                                value={lastName}
                                onChangeText={(t) => {
                                    setLastName(t);
                                    if (errors.lastName) setErrors(prev => ({ ...prev, lastName: undefined }));
                                }}
                                placeholder="Enter last name"
                                error={errors.lastName}
                                testID="input-lastName"
                            />

                            {/* Age */}
                            <EditField
                                label="AGE"
                                value={age}
                                onChangeText={(t) => {
                                    setAge(t);
                                    if (errors.age) setErrors(prev => ({ ...prev, age: undefined }));
                                }}
                                placeholder="Enter age"
                                keyboardType="number-pad"
                                error={errors.age}
                                testID="input-age"
                            />

                            {/* Info note */}
                            <View style={modalStyles.infoRow}>
                                <Text style={modalStyles.infoIcon}>ℹ️</Text>
                                <Text style={modalStyles.infoText}>
                                    Only your name and age can be updated here. To change your email, please contact support.
                                </Text>
                            </View>
                        </ScrollView>
                    </KeyboardAvoidingView>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

// ── Reusable Input Field ──────────────────────────────────────────────────────
interface EditFieldProps {
    label:          string;
    value:          string;
    onChangeText:   (t: string) => void;
    placeholder?:   string;
    keyboardType?:  'default' | 'number-pad';
    error?:         string;
    testID?:        string;
}

const EditField: React.FC<EditFieldProps> = ({
    label,
    value,
    onChangeText,
    placeholder,
    keyboardType = 'default',
    error,
    testID,
}) => (
    <View style={fieldStyles.wrapper}>
        <Text style={fieldStyles.label}>{label}</Text>
        <TextInput
            testID={testID}
            style={[fieldStyles.input, error ? fieldStyles.inputError : null]}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor="#C9CDD4"
            keyboardType={keyboardType}
            autoCapitalize={keyboardType === 'number-pad' ? 'none' : 'words'}
            returnKeyType="done"
        />
        {error ? <Text style={fieldStyles.errorText}>{error}</Text> : null}
    </View>
);

// ── Profile Screen ────────────────────────────────────────────────────────────
const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
    const dispatch = useAppDispatch();
    // remove: const { signOut } = useAuth();
    
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editVisible, setEditVisible] = useState(false);

    const handleLogout = async () => {
        await dispatch(logout());
        // isLoggedIn flips to false in Redux → App.tsx auto-navigates to SignIn
    };

    useEffect(() => {
        UserService.getProfile()
            .then(data => {
                if (!data) {
                    handleLogout(); // token expired
                    return;
                }
                setProfile(data);
            })
            .catch(() => setError('Something went wrong'))
            .finally(() => setIsLoading(false));
    }, []);

    // Merge the 3 editable fields back into the local profile state
    const handleSaved = (updated: EditProfilePayload) => {
        setProfile(prev => prev ? { ...prev, ...updated } : prev);
    };

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
                        <View style={styles.avatarCircle}>
                            <Text style={styles.avatarInitials}>{initials}</Text>
                        </View>
                        <TouchableOpacity style={styles.editBadge}>
                            <Text style={styles.editBadgeIcon}>✎</Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.fullName}>
                        {profile.firstName} {profile.lastName}
                    </Text>
                    <Text style={styles.username}>@{profile.username}</Text>
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
                        <TouchableOpacity
                            testID="edit-details-button"
                            onPress={() => setEditVisible(true)}
                        >
                            <Text style={styles.editDetails}>Edit Details</Text>
                        </TouchableOpacity>
                    </View>

                    <FieldRow label="EMAIL ADDRESS" value={profile.email} />
                    <FieldRow label="FIRST NAME"    value={profile.firstName} />
                    <FieldRow label="LAST NAME"     value={profile.lastName} />
                    <FieldRow label="AGE"           value={String(profile.age)} last />
                </View>

                {/* ── Order History Row ── */}
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
                <TouchableOpacity
                    testID="logout-button"
                    style={styles.menuCard}
                    onPress={async () => await handleLogout()}
                >
                    <View style={styles.menuLeft}>
                        <View style={[styles.menuIconBox, { backgroundColor: '#FEF2F2' }]}>
                            <Text style={[styles.menuIcon, { color: '#E53935' }]}>🚪</Text>
                        </View>
                        <Text style={[styles.menuLabel, { color: '#E53935' }]}>Logout</Text>
                    </View>
                </TouchableOpacity>

            </ScrollView>

            {/* ── Edit Details Modal ── */}
            {editVisible && (
                <EditDetailsModal
                    visible={editVisible}
                    profile={profile}
                    onClose={() => setEditVisible(false)}
                    onSaved={handleSaved}
                />
            )}
        </View>
    );
};

// ── Field Row (read-only display) ─────────────────────────────────────────────
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

// ── Styles ────────────────────────────────────────────────────────────────────
const fieldStyles = StyleSheet.create({
    wrapper: {
        marginBottom: 12,
    },
    label: {
        fontSize:      10,
        color:         '#9CA3AF',
        letterSpacing: 0.8,
        marginBottom:  4,
        fontWeight:    '500',
    },
    // Read-only box (profile view)
    valueBox: {
        borderWidth:       1,
        borderColor:       '#E5E7EB',
        borderRadius:      8,
        paddingHorizontal: 14,
        paddingVertical:   11,
        backgroundColor:   '#FAFAFA',
    },
    value: {
        fontSize: 14,
        color:    '#1F2937',
    },
    // Editable input (modal)
    input: {
        borderWidth:       1,
        borderColor:       '#E5E7EB',
        borderRadius:      10,
        paddingHorizontal: 14,
        paddingVertical:   12,
        backgroundColor:   '#FAFAFA',
        fontSize:          15,
        color:             '#1F2937',
    },
    inputError: {
        borderColor:     '#E53935',
        backgroundColor: '#FFF8F8',
    },
    errorText: {
        fontSize:   11,
        color:      '#E53935',
        marginTop:  4,
        marginLeft: 2,
    },
});

const modalStyles = StyleSheet.create({
    overlay: {
        flex:            1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent:  'flex-end',
    },
    sheet: {
        backgroundColor: '#F9FAFB',
        borderTopLeftRadius:  24,
        borderTopRightRadius: 24,
        paddingBottom:        Platform.OS === 'ios' ? 34 : 24,
        maxHeight:            '85%',
    },
    handle: {
        width:           40,
        height:          4,
        borderRadius:    2,
        backgroundColor: '#D1D5DB',
        alignSelf:       'center',
        marginTop:       10,
        marginBottom:    4,
    },
    header: {
        flexDirection:     'row',
        alignItems:        'center',
        justifyContent:    'space-between',
        paddingHorizontal: 16,
        paddingVertical:   14,
        borderBottomWidth: 0.5,
        borderBottomColor: '#E5E7EB',
        backgroundColor:   '#fff',
        borderTopLeftRadius:  24,
        borderTopRightRadius: 24,
    },
    title: {
        fontSize:   16,
        fontWeight: '700',
        color:      '#111827',
    },
    cancelBtn: {
        minWidth: 60,
    },
    cancelText: {
        fontSize:   14,
        color:      '#6B7280',
        fontWeight: '500',
    },
    saveBtn: {
        minWidth:          60,
        alignItems:        'flex-end',
        backgroundColor:   '#00C2CB',
        paddingHorizontal: 14,
        paddingVertical:   7,
        borderRadius:      20,
    },
    saveBtnDisabled: {
        backgroundColor: '#A5F3FC',
    },
    saveText: {
        fontSize:   14,
        color:      '#fff',
        fontWeight: '700',
    },
    body: {
        padding:       20,
        paddingBottom: 12,
    },
    infoRow: {
        flexDirection:  'row',
        alignItems:     'flex-start',
        gap:            8,
        marginTop:      8,
        padding:        12,
        backgroundColor: '#F0FDFA',
        borderRadius:   10,
        borderWidth:    1,
        borderColor:    '#CCFBF1',
    },
    infoIcon: {
        fontSize: 13,
        lineHeight: 18,
    },
    infoText: {
        flex:       1,
        fontSize:   12,
        color:      '#0F766E',
        lineHeight: 18,
    },
});

const styles = StyleSheet.create({
    container: {
        flex:            1,
        backgroundColor: '#F9FAFB',
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
        color:      '#92400E',
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