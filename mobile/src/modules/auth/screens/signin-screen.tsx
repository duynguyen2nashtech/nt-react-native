import { FC, useState } from 'react';
import {
    Text,
    TouchableOpacity,
    View,
    Alert,
    StyleSheet,
    TextInput,
    ScrollView,
    SafeAreaView,
    Platform,
} from 'react-native';
import { useAuth } from '../context/auth-context';
import { AuthService } from '../services/auth-service';


interface ISignInScreen {
    navigation: any;
}

export const SignInScreen: FC<ISignInScreen> = ({ navigation }) => {
    const { login } = useAuth();

    const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
    const [username, setUsername] = useState('duynguyen');
    const [password, setPassword] = useState('12345678');
    const [useBiometrics, setUseBiometrics] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    async function onPressSignIn() {
        try {
            const success = await login(username, password);
            if (success) {
                navigation.replace('Main');
            } else {
                Alert.alert('Login failed', 'Invalid username or password.');
            }
        } catch {
            Alert.alert('Login failed', 'Something went wrong. Please try again.');
        }
    }

    return (
        <SafeAreaView style={styles.safe}>
            <ScrollView
                contentContainerStyle={styles.scroll}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.card}>

                    {/* Lock icon */}
                    <View style={styles.iconWrap}>
                        <Text style={styles.lockIcon}>🔒</Text>
                    </View>

                    {/* Title */}
                    <Text style={styles.title}>Welcome Back</Text>
                    <Text style={styles.subtitle}>Please enter your details</Text>

                    {/* Tab switcher */}
                    <View style={styles.tabBar}>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'login' && styles.tabActive]}
                            onPress={() => setActiveTab('login')}
                        >
                            <Text style={[styles.tabText, activeTab === 'login' && styles.tabTextActive]}>
                                Login
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'signup' && styles.tabActive]}
                            onPress={() => {
                                setActiveTab('signup');
                                navigation.navigate('SignUp');
                            }}
                        >
                            <Text style={[styles.tabText, activeTab === 'signup' && styles.tabTextActive]}>
                                Sign Up
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Username */}
                    <Text style={styles.label}>Username</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="johndoe123"
                        placeholderTextColor="#9CA3AF"
                        value={username}
                        onChangeText={setUsername}
                        autoCapitalize="none"
                    />

                    {/* Password */}
                    <Text style={styles.label}>Password</Text>
                    <View style={styles.passwordWrap}>
                        <TextInput
                            style={styles.passwordInput}
                            placeholder="••••••••"
                            placeholderTextColor="#9CA3AF"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                        />
                        <TouchableOpacity onPress={() => setShowPassword(p => !p)}>
                            <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁'}</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Forgot password */}
                    <TouchableOpacity style={styles.forgotWrap}>
                        <Text style={styles.forgotText}>Forgot Password?</Text>
                    </TouchableOpacity>

                    {/* Biometrics checkbox */}
                    <TouchableOpacity
                        style={styles.checkRow}
                        onPress={() => setUseBiometrics(b => !b)}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.checkbox, useBiometrics && styles.checkboxChecked]}>
                            {useBiometrics && <Text style={styles.checkmark}>✓</Text>}
                        </View>
                        <Text style={styles.checkLabel}>Use biometrics for faster login</Text>
                    </TouchableOpacity>

                    {/* Sign In button */}
                    <TouchableOpacity style={styles.signInBtn} onPress={onPressSignIn} activeOpacity={0.85}>
                        <Text style={styles.signInText}>Sign In</Text>
                    </TouchableOpacity>

                    {/* Biometrics button */}
                    <TouchableOpacity style={styles.biometricsBtn} activeOpacity={0.8}>
                        <Text style={styles.biometricsIcon}>⬡ </Text>
                        <Text style={styles.biometricsText}>Sign in with Biometrics</Text>
                    </TouchableOpacity>

                    {/* Or continue with */}
                    <View style={styles.dividerRow}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>Or continue with</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    {/* Social buttons */}
                    <View style={styles.socialRow}>
                        <TouchableOpacity style={styles.socialBtn}>
                            <Text style={styles.socialIcon}>G</Text>
                            <Text style={styles.socialLabel}>Google</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.socialBtn}>
                            <Text style={[styles.socialIcon, { color: '#1877F2' }]}>f</Text>
                            <Text style={styles.socialLabel}>Facebook</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Terms */}
                    <Text style={styles.terms}>
                        By continuing, you agree to our{' '}
                        <Text style={styles.termsLink}>Terms of Service</Text>
                        {' '}and{' '}
                        <Text style={styles.termsLink}>Privacy Policy</Text>.
                    </Text>

                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: '#F0FAFA',
    },
    scroll: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
        shadowColor: '#00C2CB',
        shadowOpacity: 0.08,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
    },

    /* Icon */
    iconWrap: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#E0FAFA',
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    lockIcon: {
        fontSize: 28,
    },

    /* Title */
    title: {
        fontSize: 22,
        fontWeight: '800',
        color: '#111827',
        textAlign: 'center',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 13,
        color: '#9CA3AF',
        textAlign: 'center',
        marginBottom: 20,
    },

    /* Tab bar */
    tabBar: {
        flexDirection: 'row',
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        padding: 4,
        marginBottom: 24,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 10,
        alignItems: 'center',
    },
    tabActive: {
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 1 },
        elevation: 2,
    },
    tabText: {
        fontSize: 14,
        color: '#9CA3AF',
        fontWeight: '500',
    },
    tabTextActive: {
        color: '#111827',
        fontWeight: '700',
    },

    /* Fields */
    label: {
        fontSize: 13,
        color: '#374151',
        fontWeight: '500',
        marginBottom: 6,
    },
    input: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: Platform.OS === 'ios' ? 13 : 10,
        fontSize: 14,
        color: '#111827',
        backgroundColor: '#FAFAFA',
        marginBottom: 16,
    },
    passwordWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 10,
        paddingHorizontal: 14,
        backgroundColor: '#FAFAFA',
        marginBottom: 10,
    },
    passwordInput: {
        flex: 1,
        paddingVertical: Platform.OS === 'ios' ? 13 : 10,
        fontSize: 14,
        color: '#111827',
    },
    eyeIcon: {
        fontSize: 16,
        paddingLeft: 8,
    },

    /* Forgot */
    forgotWrap: {
        alignSelf: 'flex-end',
        marginBottom: 14,
    },
    forgotText: {
        fontSize: 13,
        color: '#00C2CB',
        fontWeight: '600',
    },

    /* Checkbox */
    checkRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 22,
        gap: 10,
    },
    checkbox: {
        width: 18,
        height: 18,
        borderRadius: 4,
        borderWidth: 1.5,
        borderColor: '#D1D5DB',
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxChecked: {
        backgroundColor: '#00C2CB',
        borderColor: '#00C2CB',
    },
    checkmark: {
        fontSize: 11,
        color: '#fff',
        fontWeight: '700',
    },
    checkLabel: {
        fontSize: 13,
        color: '#374151',
    },

    /* Sign in */
    signInBtn: {
        backgroundColor: '#00C2CB',
        borderRadius: 14,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 12,
        shadowColor: '#00C2CB',
        shadowOpacity: 0.35,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
    },
    signInText: {
        fontSize: 16,
        fontWeight: '800',
        color: '#fff',
        letterSpacing: 0.3,
    },

    /* Biometrics */
    biometricsBtn: {
        flexDirection: 'row',
        borderWidth: 1.5,
        borderColor: '#00C2CB',
        borderRadius: 14,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        gap: 6,
    },
    biometricsIcon: {
        fontSize: 18,
        color: '#00C2CB',
    },
    biometricsText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#00C2CB',
    },

    /* Divider */
    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 8,
    },
    dividerLine: {
        flex: 1,
        height: 0.5,
        backgroundColor: '#E5E7EB',
    },
    dividerText: {
        fontSize: 12,
        color: '#9CA3AF',
    },

    /* Social */
    socialRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 20,
    },
    socialBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingVertical: 12,
        backgroundColor: '#FAFAFA',
    },
    socialIcon: {
        fontSize: 16,
        fontWeight: '800',
        color: '#EA4335',
    },
    socialLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#374151',
    },

    /* Terms */
    terms: {
        fontSize: 11,
        color: '#9CA3AF',
        textAlign: 'center',
        lineHeight: 17,
    },
    termsLink: {
        color: '#6B7280',
        textDecorationLine: 'underline',
    },
});
