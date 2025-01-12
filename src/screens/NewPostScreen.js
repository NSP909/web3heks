import React, { useState, useContext } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, Image, Keyboard, Alert } from 'react-native';
import { Text, Button, Icon, Avatar } from '@rneui/themed';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Context as PostContext } from '../context/PostContext';
import { Context as BalanceContext } from '../context/BalanceContext';

import axios from 'axios';


const NewPostScreen = ({ navigation, route }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [deed, setDeed] = useState('');
    const { addPost } = useContext(PostContext);
    const { state, updateBalance, updateContributions } = useContext(BalanceContext);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState(null);

    const dismissKeyboard = () => {
        Keyboard.dismiss();
    };
    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const handlePost = () => {
        // if (title && description) {
        //     const newPost = {
        //         id: Date.now().toString(),
        //         user: 'Karen', // Replace with actual user name
        //         avatar: 'https://randomuser.me/api/portraits/women/41.jpg', // Replace with actual user avatar
        //         title,
        //         description,
        //         image: image || 'https://via.placeholder.com/400x250',
        //         likes: 0,
        //         comments: 0,
        //     };
        // }

        addPost(deed, description, image);
        navigation.goBack();
    };

    const handleVerify = async () => {
        if (!image || !deed) {
            Alert.alert('Error', 'Please upload an image and enter a deed.');
            return;
        }

        setIsLoading(true);

        const formData = new FormData();
        formData.append('image', {
            uri: image,
            type: 'image/jpeg',
            name: 'image.jpg',
        });
        formData.append('deed', deed);

        // 10.1.98.18:5000

        try {
            const response = await axios.post('http://192.168.1.4:8000/verify_deed', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            console.log('Response:', response.data.result.toLowerCase().replace(/\s+/g, ' ').trim());
            if (response.data.result.toLowerCase().replace(/\s+/g, ' ').trim() === 'yes') {
                updateBalance(state.balance + 0.125);
                updateContributions(state.userContributions + 1);
                Alert.alert('Approved', 'Your deed has been verified and approved! You earned 0.125 SOL.');
                navigation.goBack();
            } else {
                console.log('Condition not met: Not Approved');
                Alert.alert('Not Approved', 'The deed could not be verified based on the image.');
            }
        } catch (error) {
            console.error('Error:', error);
            Alert.alert('Error', 'An error occurred while verifying the deed.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} onTouchStart={dismissKeyboard}>
            <View style={styles.header}>
                <Avatar
                    rounded
                    source={{ uri: 'https://randomuser.me/api/portraits/women/41.jpg' }}
                    size="small"
                />
                <Text h4 style={styles.headerTitle}>Verify Deed</Text>
            </View>
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Enter deed"
                    placeholderTextColor="#8899AA"
                    value={deed}
                    onChangeText={setDeed}
                />
                <TextInput
                    style={[styles.input, styles.descriptionInput]}
                    placeholder="Enter description"
                    placeholderTextColor="#8899AA"
                    multiline
                    numberOfLines={4}
                    value={description}
                    onChangeText={setDescription}
                />
                <TouchableOpacity style={styles.imageUpload} onPress={pickImage}>
                    {image ? (
                        <Image source={{ uri: image }} style={styles.uploadedImage} />
                    ) : (
                        <>
                            <Icon name="upload" type="feather" color="#8899AA" size={24} />
                            <Text style={styles.uploadText}>Upload image</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
            <Button
                title={isLoading ? "Verifying..." : "Verify Deed"}
                onPress={handleVerify}
                buttonStyle={styles.verifyButton}
                disabled={isLoading || !image || !deed}
            />
            <Button
                title="Post"
                onPress={handlePost}
                buttonStyle={styles.postButton}
                disabled={!deed || !description}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1E2746',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
    },
    headerTitle: {
        color: '#FFF',
        marginLeft: 10,
    },
    inputContainer: {
        padding: 20,
    },
    input: {
        backgroundColor: '#2A365A',
        borderRadius: 10,
        padding: 15,
        color: '#FFF',
        marginBottom: 15,
    },
    descriptionInput: {
        height: 100,
        textAlignVertical: 'top',
    },
    imageUpload: {
        backgroundColor: '#2A365A',
        borderRadius: 10,
        height: 150,
        justifyContent: 'center',
        alignItems: 'center',
    },
    uploadText: {
        color: '#8899AA',
        marginTop: 10,
    },
    uploadedImage: {
        width: '100%',
        height: '100%',
        borderRadius: 10,
    },
    verifyButton: {
        backgroundColor: '#4ECDC4',
        marginHorizontal: 20,
    },
    postButton: {
        backgroundColor: '#4ECDC4',
        marginHorizontal: 20,
        marginTop: 20,
    },
});

export default NewPostScreen;

