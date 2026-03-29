import React, { useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

interface ListItemProps {
    item: {
        id: number;
        title: string;
        body: string;
        imageUrl: string;
    };
}

const ListItem: React.FC<ListItemProps> = ({ item }) => {
    const [imgError, setImgError] = useState(false);

    return (
        <View style={styles.listItem}>
            {item.imageUrl && !imgError ? (
                <Image
                    source={{ uri: item.imageUrl }}
                    style={styles.image}
                    resizeMode="cover"
                    onError={() => setImgError(true)}
                />
            ) : (
                <View style={styles.placeholder}>
                    <Text style={styles.placeholderText}>
                        {item.title?.[0]?.toUpperCase() ?? '?'}
                    </Text>
                </View>
            )}

            <View style={styles.textContainer}>
                <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
                <Text style={styles.body} numberOfLines={2}>{item.body}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        padding: 12,
        backgroundColor: '#fff',
    },
    image: {
        width: 56,
        height: 56,
        borderRadius: 8,
        marginRight: 12,
        backgroundColor: '#F3F4F6',
    },
    placeholder: {
        width: 56,
        height: 56,
        borderRadius: 8,
        marginRight: 12,
        backgroundColor: '#E0FAFA',
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        fontSize: 22,
        fontWeight: '700',
        color: '#00C2CB',
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 4,
    },
    body: {
        fontSize: 12,
        color: '#6B7280',
    },
});

export default ListItem;