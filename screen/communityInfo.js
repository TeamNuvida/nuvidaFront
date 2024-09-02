import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
    StyleSheet,
    View,
    Text,
    Image,
    FlatList,
    TouchableOpacity,
    SafeAreaView,
    TextInput,
    ScrollView,
    ActivityIndicator,
    Modal
} from 'react-native';
import { FontAwesome, MaterialCommunityIcons, AntDesign } from '@expo/vector-icons';
import axios from 'axios';

const organizeComments = (comments) => {
    const organizedComments = [];
    const commentMap = {};

    // 댓글을 맵으로 변환
    comments.forEach(comment => {
        if (comment.cmt_num === 0) {
            comment.replies = [];
            commentMap[comment.cmt_seq] = comment;
            organizedComments.push(comment);
        } else {
            // 대댓글은 해당 댓글의 replies에 추가
            if (commentMap[comment.cmt_num]) {
                commentMap[comment.cmt_num].replies.push(comment);
            }
        }
    });

    return organizedComments;
};

const CommunityInfo = ({route}) => {
    const [comment, setComment] = useState('');
    const [replyTo, setReplyTo] = useState(null);  // 어떤 댓글에 답글을 달지 결정하는 상태

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedImageUri, setSelectedImageUri] = useState(null);

    const data = route.params.cmtInfo;
    const [cmtInfo, setCmtInfo] = useState({
        ...data,
        comments: organizeComments(data.comments),
    });
    const [intTF, setIntTF] = useState(route.params.intTF);
    const navigation = useNavigation();
    const localhost = "54.180.146.203";
    const userInfo = {user_id:'test', user_nick:'test'}

    const openImageModal = (imageUri) => {
        setSelectedImageUri(imageUri);
        setIsModalVisible(true);
    };

    const closeImageModal = () => {
        setIsModalVisible(false);
        setSelectedImageUri(null);
    };


    const renderCommentItem = ({ item }) => {
        return (
            <>
                <View style={styles.commentContainer}>
                    <View style={styles.commentHeader}>
                        {item.profile_img ? <Image source={{ uri: item.profile_img }} style={styles.commentProfile} /> : <Image source={{ uri: 'https://firebasestorage.googleapis.com/v0/b/high-service-431903-t6.appspot.com/o/imgtest%2Fprofile.png?alt=media&token=668cdcff-3447-406d-a46c-de24b34235e0' }} style={styles.commentProfile} />}
                        <Text style={styles.commentNick}>{item.user_nick}</Text>
                        <Text style={styles.commentDate}>{item.regi_at}</Text>
                        <View style={{paddingLeft:10}}></View>
                    </View>
                    <Text style={styles.commentText}>{item.cmt_detail}</Text>
                    <TouchableOpacity onPress={() => setReplyTo(item)}>
                        <Text style={styles.replyText}>답글 작성하기</Text>
                    </TouchableOpacity>
                </View>
                {item.replies && item.replies.map(reply => (
                    <View key={reply.cmt_seq} style={[styles.commentContainer, { marginLeft: 30 }]}>
                        <View style={styles.commentHeader}>
                            {reply.profile_img ? <Image source={{ uri: reply.profile_img }} style={styles.commentProfile} /> : <Image source={{ uri: 'https://firebasestorage.googleapis.com/v0/b/high-service-431903-t6.appspot.com/o/imgtest%2Fprofile.png?alt=media&token=668cdcff-3447-406d-a46c-de24b34235e0' }} style={styles.commentProfile} />}
                            <Text style={styles.commentNick}>{reply.user_nick}</Text>
                            <Text style={styles.commentDate}>{reply.regi_at}</Text>
                            <View style={{paddingLeft:10}}></View>
                        </View>
                        <Text style={styles.commentText}>{reply.cmt_detail}</Text>
                        <TouchableOpacity onPress={() => setReplyTo(reply)}>
                            <Text style={styles.replyText}>답글 작성하기</Text>
                        </TouchableOpacity>
                    </View>
                ))}
                <View style={styles.lineCmt} />
            </>

        );
    };


    const renderHeader = () => (
        <View style={styles.postContainer}>
            <View style={styles.postHeader}>

                {cmtInfo.profile ? <Image source={{ uri: cmtInfo.profile }} style={styles.profileImage} /> : <Image source={{ uri: 'https://firebasestorage.googleapis.com/v0/b/high-service-431903-t6.appspot.com/o/imgtest%2Fprofile.png?alt=media&token=668cdcff-3447-406d-a46c-de24b34235e0' }} style={styles.profileImage} />}

                {/*<Image source={{ uri: cmtInfo.profile }} style={styles.profileImage} />*/}
                <View style={styles.postHeaderText}>
                    <Text style={styles.nickText}>{cmtInfo.user_nick}</Text>
                    <Text style={styles.dateText}>{cmtInfo.regi_at}</Text>
                </View>
                <View style={styles.postHeartContainer}>
                    <Text style={styles.heartCountText}>{cmtInfo.intCount}</Text>
                    <TouchableOpacity onPress={()=> handleInt()}>
                        {intTF? <FontAwesome name="heart" size={24} color="red" /> : <FontAwesome name="heart-o" size={24} color="red" />}
                    </TouchableOpacity>
                    <View style={{paddingLeft:10}}></View>
                </View>
            </View>
            <Text style={styles.titleText}>{cmtInfo.post_title}</Text>
            <Text style={styles.detailsText}>{cmtInfo.details}</Text>
            {cmtInfo.images && cmtInfo.images.length > 0 && (
                <ScrollView horizontal style={styles.imageContainer}>
                    {cmtInfo.images.map((imageUri, index) => (
                        <TouchableOpacity key={index} onPress={() => openImageModal(imageUri.img_filename)}>
                            <Image key={index} source={{ uri: imageUri.img_filename }} style={styles.image} />
                        </TouchableOpacity>

                    ))}
                </ScrollView>
            )}

            <Modal visible={isModalVisible} transparent={true}>
                <View style={styles.modalContainer}>
                    <View style={styles.fullImageContainer}>
                    <Image source={{ uri: selectedImageUri }} style={styles.fullscreenImage} />
                    <TouchableOpacity style={styles.closeButton} onPress={closeImageModal}>
                        <AntDesign name="closesquare" size={30} color="red" />
                    </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            <View style={styles.line} />
        </View>

    );

    const handleInt = async () => {
        if(intTF){
            console.log("관심등록해제");

            const response = await axios.post(`http://${localhost}:8090/nuvida/delInt`, {post_seq:cmtInfo.post_seq, user_id:userInfo.user_id});

            cmtInfo.intCount = cmtInfo.intCount -1;
            setIntTF(false);
        }else{
            console.log("관심등록");
            const response = await axios.post(`http://${localhost}:8090/nuvida/insertInt`, {post_seq:cmtInfo.post_seq, user_id:userInfo.user_id});

            cmtInfo.intCount = cmtInfo.intCount +1;
            setIntTF(true);
        }
    };

    const handleCommentSubmit = async() => {
        if (comment.trim() === '') {
            return;
        }

        const cmt_num = replyTo?(replyTo.cmt_num == 0? replyTo.cmt_seq:replyTo.cmt_num) : 0;

        // 여기에서 댓글 또는 답글을 등록하는 로직 추가
        console.log("cmt_num", cmt_num)
        console.log(replyTo ? `답글 등록 [${cmt_num}]:` : '댓글 등록:', comment);

        try {
            const response = await axios.post(`http://${localhost}:8090/nuvida/insertCmt`, {post_seq:cmtInfo.post_seq, cmt_detail:comment, user_id:userInfo.user_id, cmt_num:cmt_num});
            console.log(response.data);
            setCmtInfo({
                ...response.data,
                comments: organizeComments(response.data.comments),
            });
        } catch (error) {
            console.error('Error fetching plan data:', error);
        }



        // 댓글 또는 답글을 등록한 후 초기화
        setComment('');
        setReplyTo(null);
    };


    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerContainer}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>NUVIDA</Text>
            </View>
            <FlatList
                data={cmtInfo.comments}
                renderItem={renderCommentItem}
                keyExtractor={item => item.cmt_seq.toString()}
                ListHeaderComponent={renderHeader} // 게시물 정보 렌더링
                contentContainerStyle={styles.commentsContainer}
            />
            <View style={styles.commentInputContainer}>
                {replyTo && (
                    <View style={styles.replyInfo}>
                        <Text style={styles.replyInfoText}>답글을 작성 중입니다...</Text>
                        <TouchableOpacity onPress={() => setReplyTo(null)}>
                            <Text style={styles.cancelReply}>취소</Text>
                        </TouchableOpacity>
                    </View>
                )}
                <TextInput
                    style={styles.commentInput}
                    placeholder="댓글을 입력하세요."
                    value={comment}
                    onChangeText={setComment}
                />
                <TouchableOpacity style={styles.commentButton} onPress={handleCommentSubmit}>
                    <Text style={styles.commentButtonText}>등록</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default CommunityInfo;

const styles = StyleSheet.create({

    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        marginTop: 20,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'red',
        textAlign: 'center',
        flex: 1, // 중앙 정렬을 위해 추가
    },
    postContainer: {
        paddingHorizontal: 15,
        paddingVertical: 10,
    },
    postHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom:20,
    },
    profileImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    postHeaderText: {
        flex: 1,
        marginLeft: 10,
    },
    nickText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    dateText: {
        fontSize: 12,
        color: '#888',
        marginVertical: 5,

    },
    postHeartContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    heartCountText: {
        marginRight: 5,
        fontSize: 16,
    },
    titleText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginVertical: 10,
    },
    detailsText: {
        fontSize: 14,
        marginVertical: 15,
        lineHeight: 20,
    },
    imageContainer: {
        flexDirection: 'row',
        marginTop: 10, // 여유 공간 추가
        marginBottom:10,
    },
    image: {
        width: 150,  // 이미지 폭 조정
        height: 150, // 이미지 높이 조정
        borderRadius: 8,
        marginRight: 10,  // 이미지 간의 간격 추가
    },
    commentsContainer: {
        paddingHorizontal: 7,
        paddingTop:15,
    },
    commentContainer: {
        paddingBottom: 10,
        marginBottom: 10,
        paddingHorizontal:15,
    },
    commentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    commentProfile: {
        width: 30,
        height: 30,
        borderRadius: 15,
        marginRight: 10,
    },
    commentNick: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    commentDate: {
        fontSize: 12,
        color: '#888',
        marginLeft: 'auto',
    },
    commentText: {
        fontSize: 14,
        marginTop: 5,
        marginLeft: 40,
    },
    replyText: {
        color: '#007AFF',
        marginTop: 5,
        marginLeft: 40,
    },
    commentInputContainer: {
        flexDirection: 'row',
        padding: 10,
        borderTopWidth: 1,
        borderTopColor: '#ddd',
    },
    replyInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    replyInfoText: {
        flex: 1,
        fontSize: 14,
        color: '#888',
    },
    cancelReply: {
        color: '#007AFF',
        fontSize: 14,
    },
    commentInput: {
        flex: 1,
        height: 40,
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 20,
        paddingHorizontal: 15,
        marginRight: 10,
    },
    commentButton: {
        backgroundColor: '#000',
        borderRadius: 20,
        paddingHorizontal: 15,
        justifyContent: 'center',
    },
    commentButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    line: {
        width: '95%',
        height: 0.5,
        marginVertical:15,
        backgroundColor: '#C2C2C2'
    },
    lineCmt: {
        width: '95%',
        marginVertical: 15,
        borderBottomWidth: 0.5,
        borderBottomColor: 'rgba(204,204,204,0.49)',
        borderStyle: 'dashed', // 이 부분은 적용이 안될 수 있습니다.
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.44)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullImageContainer: {
        position: 'relative',
        width: '90%',
        height: '70%',
    },
    fullscreenImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },
    closeButton: {
        position: 'absolute',
        right:0
    },
});
