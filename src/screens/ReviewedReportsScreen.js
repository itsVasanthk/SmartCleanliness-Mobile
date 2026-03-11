import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert, Image, TouchableOpacity } from 'react-native';
import { Text, Card, Title, Paragraph, Button, useTheme, ActivityIndicator, IconButton } from 'react-native-paper';
import { CheckCircle, XCircle, Clock, MapPin, ChevronLeft, Trash2 } from 'lucide-react-native';
import { fetchAllComplaints, authorityDecide, UPLOAD_URL } from '../api/api';

const ReviewedReportsScreen = ({ navigation, route }) => {
    const { user } = route.params;
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const theme = useTheme();

    const loadData = async () => {
        try {
            const data = await fetchAllComplaints();
            // Filter only reviewed reports
            setComplaints(data.filter(c => c.authority_decision !== 'pending'));
        } catch (err) {
            console.error(err);
            Alert.alert('Error', 'Failed to load reviewed reports');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadData();
    }, []);

    const handleResolve = async (id) => {
        try {
            await authorityDecide(id, 'resolved');
            Alert.alert('Success', 'Report marked as resolved');
            loadData();
        } catch (err) {
            Alert.alert('Error', err.message);
        }
    };

    if (loading && !refreshing) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    const PremiumCard = ({ item }) => {
        const isAgreed = item.authority_decision === 'agreed';
        const isResolved = item.status === 'Resolved';

        return (
            <Card style={styles.card}>
                <View style={styles.cardContent}>
                    <View style={styles.imageSection}>
                        {item.image ? (
                            <Image
                                source={{ uri: `${UPLOAD_URL}/${item.image}` }}
                                style={styles.cardImage}
                                resizeMode="cover"
                            />
                        ) : (
                            <View style={[styles.cardImage, styles.imagePlaceholder]}>
                                <Text style={{ fontSize: 10, color: '#999' }}>No Image</Text>
                            </View>
                        )}
                        <View style={[styles.decisionBadge, { backgroundColor: isAgreed ? '#4CAF50' : '#F44336' }]}>
                            {isAgreed ? <CheckCircle size={12} color="#fff" /> : <XCircle size={12} color="#fff" />}
                            <Text style={styles.decisionText}>{item.authority_decision.toUpperCase()}</Text>
                        </View>
                    </View>

                    <View style={styles.infoSection}>
                        <View style={styles.typeHeader}>
                            <Text style={styles.typeText}>{item.type}</Text>
                            {isResolved && (
                                <View style={styles.resolvedBadge}>
                                    <Text style={styles.resolvedText}>RESOLVED</Text>
                                </View>
                            )}
                        </View>

                        <View style={styles.locationRow}>
                            <MapPin size={14} color="#666" />
                            <Text style={styles.locationText} numberOfLines={1}>{item.area}</Text>
                        </View>

                        <Paragraph style={styles.description} numberOfLines={2}>
                            {item.description}
                        </Paragraph>

                        {item.authority_reason && (
                            <View style={styles.reasonBox}>
                                <Text style={styles.reasonLabel}>Reason:</Text>
                                <Text style={styles.reasonText} numberOfLines={1}>{item.authority_reason}</Text>
                            </View>
                        )}

                        <View style={styles.footer}>
                            <View style={styles.timeRow}>
                                <Clock size={12} color="#999" />
                                <Text style={styles.timeText}>{item.created_at.split(' ')[0]}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {isAgreed && !isResolved && (
                    <View style={styles.actionSection}>
                        <Button
                            mode="contained"
                            onPress={() => handleResolve(item.id)}
                            style={styles.resolveBtn}
                            buttonColor="#2E7D32"
                            icon="check-all"
                        >
                            Mark as Resolved
                        </Button>
                    </View>
                )}
            </Card>
        );
    };

    return (
        <View style={styles.container}>
            <ScrollView
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                contentContainerStyle={styles.scrollContent}
            >
                {complaints.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Title style={styles.emptyTitle}>No Reviewed Reports</Title>
                        <Paragraph style={styles.emptyDesc}>Reports you take action on will appear here.</Paragraph>
                    </View>
                ) : (
                    complaints.map(item => <PremiumCard key={item.id} item={item} />)
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        padding: 16,
    },
    card: {
        marginBottom: 20,
        borderRadius: 16,
        backgroundColor: '#fff',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        overflow: 'hidden',
    },
    cardContent: {
        flexDirection: 'row',
        padding: 12,
    },
    imageSection: {
        width: 100,
        height: 120,
        position: 'relative',
    },
    cardImage: {
        width: '100%',
        height: '100%',
        borderRadius: 12,
    },
    imagePlaceholder: {
        backgroundColor: '#F0F0F0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    decisionBadge: {
        position: 'absolute',
        bottom: -8,
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#fff',
    },
    decisionText: {
        color: '#fff',
        fontSize: 9,
        fontWeight: 'bold',
        marginLeft: 4,
    },
    infoSection: {
        flex: 1,
        marginLeft: 16,
        justifyContent: 'space-between',
    },
    typeHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    typeText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1A1A1A',
    },
    resolvedBadge: {
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    resolvedText: {
        color: '#2E7D32',
        fontSize: 9,
        fontWeight: 'bold',
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    locationText: {
        fontSize: 12,
        color: '#666',
        marginLeft: 4,
    },
    description: {
        fontSize: 13,
        color: '#444',
        marginTop: 6,
        lineHeight: 18,
    },
    reasonBox: {
        backgroundColor: '#FFF5F5',
        padding: 6,
        borderRadius: 6,
        marginTop: 8,
        flexDirection: 'row',
    },
    reasonLabel: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#C62828',
    },
    reasonText: {
        fontSize: 11,
        color: '#C62828',
        marginLeft: 4,
        flex: 1,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 10,
    },
    timeRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    timeText: {
        fontSize: 11,
        color: '#999',
        marginLeft: 4,
    },
    actionSection: {
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        padding: 12,
        backgroundColor: '#FAFAFA',
    },
    resolveBtn: {
        borderRadius: 10,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 100,
    },
    emptyTitle: {
        color: '#CCC',
    },
    emptyDesc: {
        color: '#999',
        textAlign: 'center',
    }
});

export default ReviewedReportsScreen;
