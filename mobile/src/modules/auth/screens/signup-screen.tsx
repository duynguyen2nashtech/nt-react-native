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
import { UserService } from '../../profile/services/user-service';


interface ISignUpScreen {
    navigation: any;
}

const ROLES = ['user', 'admin'];

export const SignUpScreen: FC<ISignUpScreen> = ({ navigation }) => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [age, setAge] = useState('');
    const [role, setRole] = useState<'user' | 'admin'>('user');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    function validate(): string | null {
        if (!firstName.trim()) return 'First name is required.';
        if (!lastName.trim()) return 'Last name is required.';
        if (!email.trim() || !email.includes('@')) return 'A valid email is required.';
        if (!username.trim()) return 'Username is required.';
        if (password.length < 8) return 'Password must be at least 8 characters.';
        if (!age || isNaN(Number(age)) || Number(age) < 1) return 'A valid age is required.';
        return null;
    }

    async function onPressSignUp() {
        const err = validate();
        if (err) {
            Alert.alert('Validation Error', err);
            return;
        }

        setIsLoading(true);
        try {
            await UserService.register({
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                email: email.trim(),
                username: username.trim(),
                password,
                role,
                age: Number(age),
            });
            Alert.alert('Account created!', 'You can now sign in.', [
                { text: 'Sign In', onPress: () => navigation.replace('SignIn') },
            ]);
        } catch (e: any) {
            Alert.alert('Sign Up Failed', e?.message ?? 'Something went wrong.');
        } finally {
            setIsLoading(false);
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

                    {/* Icon */}
                    <View style={styles.iconWrap}>
                        <Text style={styles.icon}>👤</Text>
                    </View>

                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}>Fill in your details to get started</Text>

                    {/* Tab switcher */}
                    <View style={styles.tabBar}>
                        <TouchableOpacity
                            style={styles.tab}
                            onPress={() => navigation.replace('SignIn')}
                        >
                            <Text style={styles.tabText}>Login</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.tab, styles.tabActive]}>
                            <Text style={styles.tabTextActive}>Sign Up</Text>
                        </TouchableOpacity>
                    </View>

                    {/* First Name + Last Name side by side */}
                    <View style={styles.row}>
                        <View style={styles.halfField}>
                            <Text style={styles.label}>First Name</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="John"
                                placeholderTextColor="#9CA3AF"
                                value={firstName}
                                onChangeText={setFirstName}
                            />
                        </View>
                        <View style={styles.halfField}>
                            <Text style={styles.label}>Last Name</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Doe"
                                placeholderTextColor="#9CA3AF"
                                value={lastName}
                                onChangeText={setLastName}
                            />
                        </View>
                    </View>

                    {/* Email */}
                    <Text style={styles.label}>Email</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="john@example.com"
                        placeholderTextColor="#9CA3AF"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />

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
                            placeholder="Min. 8 characters"
                            placeholderTextColor="#9CA3AF"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                        />
                        <TouchableOpacity onPress={() => setShowPassword(p => !p)}>
                            <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁'}</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Age + Role side by side */}
                    <View style={styles.row}>
                        <View style={styles.halfField}>
                            <Text style={styles.label}>Age</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="18"
                                placeholderTextColor="#9CA3AF"
                                value={age}
                                onChangeText={setAge}
                                keyboardType="numeric"
                            />
                        </View>
                        <View style={styles.halfField}>
                            <Text style={styles.label}>Role</Text>
                            <View style={styles.rolePicker}>
                                {ROLES.map((r) => (
                                    <TouchableOpacity
                                        key={r}
                                        style={[
                                            styles.roleOption,
                                            role === r && styles.roleOptionActive,
                                        ]}
                                        onPress={() => setRole(r as 'user' | 'admin')}
                                    >
                                        <Text
                                            style={[
                                                styles.roleOptionText,
                                                role === r && styles.roleOptionTextActive,
                                            ]}
                                        >
                                            {r.charAt(0).toUpperCase() + r.slice(1)}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </View>

                    {/* Sign Up button */}
                    <TouchableOpacity
                        testID="signup-btn"
                        style={[styles.signUpBtn, isLoading && { opacity: 0.7 }]}
                        onPress={onPressSignUp}
                        disabled={isLoading}
                        activeOpacity={0.85}
                    >
                        <Text style={styles.signUpText}>
                            {isLoading ? 'Creating account...' : 'Create Account'}
                        </Text>
                    </TouchableOpacity>

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
    icon: { fontSize: 28 },

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
        fontSize: 14,
        color: '#111827',
        fontWeight: '700',
    },

    /* Layout */
    row: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 0,
    },
    halfField: {
        flex: 1,
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
        marginBottom: 16,
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

    /* Role picker */
    rolePicker: {
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 10,
        overflow: 'hidden',
        marginBottom: 16,
        backgroundColor: '#FAFAFA',
        height: Platform.OS === 'ios' ? 48 : 44,
    },
    roleOption: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    roleOptionActive: {
        backgroundColor: '#00C2CB',
    },
    roleOptionText: {
        fontSize: 13,
        color: '#6B7280',
        fontWeight: '500',
    },
    roleOptionTextActive: {
        color: '#fff',
        fontWeight: '700',
    },

    /* Button */
    signUpBtn: {
        backgroundColor: '#00C2CB',
        borderRadius: 14,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 4,
        marginBottom: 16,
        shadowColor: '#00C2CB',
        shadowOpacity: 0.35,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
    },
    signUpText: {
        fontSize: 16,
        fontWeight: '800',
        color: '#fff',
        letterSpacing: 0.3,
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
