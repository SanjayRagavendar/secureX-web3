import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

const Send = () => {
    return (
        <View style={styles.container}>
            <Text>Send</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
})

export default Send;
