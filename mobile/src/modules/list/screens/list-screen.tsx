// components/ApiList.tsx
import React from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import useApiData from '../hooks/use-api-data';
import ListItem from '../components/ListItem';
import Button from '../../../shared/components/Button';
import { useAuth } from '../../auth/context/auth-context';



const ListScreen: React.FC = () => {
    const { apiData, loading, error } = useApiData();
    const { user, login, signOut } = useAuth();

    return (

        <View style={{ margin: 10, flex: 1, flexDirection: 'column' }}>
            {user ? (
                <>
                    <View>
                        {loading ? (
                            <ActivityIndicator size="large" color="#0000ff" />
                        ) : error ? (
                            <Text>Error: {error}</Text>
                        ) : (
                            <FlatList
                                data={apiData}
                                keyExtractor={(item) => String(item.id)}
                                renderItem={({ item }) => (
                                    <ListItem item={{id: item.id,
                                        title: item.title,
                                        body: item.albumId.toString(),
                                        imageUrl: item.thumbnailUrl
                                    }}></ListItem>
                                )}
                            />
                        )}
                    </View>
                </>
            ) : (
                <>
                    <Text style={{ flex: 1 }}>Welcome Guest. Please login to view user data.</Text>
                    <Button title="Login" onPress={() => login('example', 'password')}>
                        <Text>Log in</Text>
                    </Button>
                </>
            )}
        </View>

    );
};

const styles = StyleSheet.create({
    listItem: {
        borderBottomWidth: 1,
        padding: 10,
    },
});

export default ListScreen;


