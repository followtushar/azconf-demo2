import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  Dimensions,
  Alert,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  FAB,
  Chip,
  Avatar,
  Text,
  Surface,
  ProgressBar,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from 'react-query';
import { format, formatDistanceToNow } from 'date-fns';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Animatable from 'react-native-animatable';

import { useAuth } from '../../contexts/AuthContext';
import { capsuleService } from '../../services/capsuleService';
import { theme } from '../../theme/theme';
import { Capsule, CapsuleStatus } from '@timecap/shared/types';
import { EMOTIONAL_TAGS } from '@timecap/shared/constants';

const { width } = Dimensions.get('window');

const DashboardScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: dashboardData,
    isLoading,
    refetch,
  } = useQuery(
    'dashboard',
    () => capsuleService.getDashboard(),
    {
      refetchInterval: 60000, // Refetch every minute for countdown updates
    }
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const getStatusColor = (status: CapsuleStatus) => {
    switch (status) {
      case CapsuleStatus.SCHEDULED:
        return theme.colors.primary;
      case CapsuleStatus.DELIVERED:
        return theme.colors.tertiary;
      case CapsuleStatus.DRAFT:
        return theme.colors.secondary;
      case CapsuleStatus.FAILED:
        return theme.colors.error;
      default:
        return theme.colors.outline;
    }
  };

  const getEmotionalTagColor = (tag: string) => {
    const emotionalTag = EMOTIONAL_TAGS.find(t => t.value === tag);
    return emotionalTag?.color || theme.colors.primary;
  };

  const formatTimeRemaining = (date: string) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch {
      return 'Invalid date';
    }
  };

  const handleCreateCapsule = () => {
    navigation.navigate('Create' as never);
  };

  const handleViewCapsule = (capsuleId: string) => {
    navigation.navigate('CapsuleDetail' as never, { id: capsuleId } as never);
  };

  const handleViewAllCapsules = () => {
    navigation.navigate('Capsules' as never);
  };

  if (isLoading && !dashboardData) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ProgressBar indeterminate color={theme.colors.primary} />
          <Text style={{ marginTop: 16 }}>Loading your dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Welcome Header */}
        <Animatable.View animation="fadeInDown" duration={600}>
          <Card style={{ marginBottom: 16 }}>
            <Card.Content>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Avatar.Text 
                  size={50} 
                  label={user?.firstName?.charAt(0) || 'U'}
                  style={{ backgroundColor: theme.colors.primary }}
                />
                <View style={{ marginLeft: 16, flex: 1 }}>
                  <Title>Welcome back, {user?.firstName}!</Title>
                  <Paragraph>
                    {dashboardData?.stats?.totalCapsules || 0} time capsules created
                  </Paragraph>
                </View>
              </View>
            </Card.Content>
          </Card>
        </Animatable.View>

        {/* Quick Stats */}
        <Animatable.View animation="fadeInUp" duration={600} delay={200}>
          <View style={{ flexDirection: 'row', marginBottom: 16 }}>
            <Surface
              style={{
                flex: 1,
                padding: 16,
                marginRight: 8,
                borderRadius: 12,
                elevation: 2,
              }}
            >
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: theme.colors.primary }}>
                {dashboardData?.stats?.scheduledCapsules || 0}
              </Text>
              <Text style={{ color: theme.colors.onSurfaceVariant }}>Scheduled</Text>
            </Surface>
            
            <Surface
              style={{
                flex: 1,
                padding: 16,
                marginHorizontal: 4,
                borderRadius: 12,
                elevation: 2,
              }}
            >
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: theme.colors.tertiary }}>
                {dashboardData?.stats?.deliveredCapsules || 0}
              </Text>
              <Text style={{ color: theme.colors.onSurfaceVariant }}>Delivered</Text>
            </Surface>
            
            <Surface
              style={{
                flex: 1,
                padding: 16,
                marginLeft: 8,
                borderRadius: 12,
                elevation: 2,
              }}
            >
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: theme.colors.secondary }}>
                {dashboardData?.stats?.draftCapsules || 0}
              </Text>
              <Text style={{ color: theme.colors.onSurfaceVariant }}>Drafts</Text>
            </Surface>
          </View>
        </Animatable.View>

        {/* Upcoming Capsules */}
        <Animatable.View animation="fadeInUp" duration={600} delay={400}>
          <Card style={{ marginBottom: 16 }}>
            <Card.Content>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Title>Upcoming Deliveries</Title>
                <Button 
                  mode="text" 
                  onPress={handleViewAllCapsules}
                  compact
                >
                  View All
                </Button>
              </View>
              
              {dashboardData?.upcomingCapsules?.length > 0 ? (
                dashboardData.upcomingCapsules.slice(0, 3).map((capsule: Capsule, index: number) => (
                  <Surface
                    key={capsule.id}
                    style={{
                      padding: 12,
                      marginTop: 12,
                      borderRadius: 8,
                      elevation: 1,
                    }}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>
                          {capsule.title}
                        </Text>
                        <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 12 }}>
                          {formatTimeRemaining(capsule.scheduledFor)}
                        </Text>
                        {capsule.emotionalTag && (
                          <Chip
                            mode="outlined"
                            compact
                            style={{ 
                              alignSelf: 'flex-start', 
                              marginTop: 8,
                              borderColor: getEmotionalTagColor(capsule.emotionalTag),
                            }}
                            textStyle={{ fontSize: 10 }}
                          >
                            {EMOTIONAL_TAGS.find(t => t.value === capsule.emotionalTag)?.label || capsule.emotionalTag}
                          </Chip>
                        )}
                      </View>
                      <Button
                        mode="text"
                        compact
                        onPress={() => handleViewCapsule(capsule.id)}
                      >
                        View
                      </Button>
                    </View>
                  </Surface>
                ))
              ) : (
                <View style={{ alignItems: 'center', padding: 20 }}>
                  <Icon name="calendar-clock" size={48} color={theme.colors.onSurfaceVariant} />
                  <Text style={{ marginTop: 8, color: theme.colors.onSurfaceVariant }}>
                    No upcoming deliveries
                  </Text>
                  <Button
                    mode="outlined"
                    onPress={handleCreateCapsule}
                    style={{ marginTop: 12 }}
                  >
                    Create Your First Capsule
                  </Button>
                </View>
              )}
            </Card.Content>
          </Card>
        </Animatable.View>

        {/* Recent Activity */}
        <Animatable.View animation="fadeInUp" duration={600} delay={600}>
          <Card style={{ marginBottom: 16 }}>
            <Card.Content>
              <Title>Recent Activity</Title>
              
              {dashboardData?.recentActivity?.length > 0 ? (
                dashboardData.recentActivity.slice(0, 5).map((activity: any, index: number) => (
                  <View
                    key={index}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingVertical: 8,
                      borderBottomWidth: index < dashboardData.recentActivity.length - 1 ? 1 : 0,
                      borderBottomColor: theme.colors.outline,
                    }}
                  >
                    <Icon
                      name={activity.type === 'created' ? 'plus-circle' : 'check-circle'}
                      size={20}
                      color={activity.type === 'created' ? theme.colors.primary : theme.colors.tertiary}
                      style={{ marginRight: 12 }}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14 }}>{activity.message}</Text>
                      <Text style={{ fontSize: 12, color: theme.colors.onSurfaceVariant }}>
                        {format(new Date(activity.timestamp), 'MMM d, h:mm a')}
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <View style={{ alignItems: 'center', padding: 20 }}>
                  <Icon name="history" size={48} color={theme.colors.onSurfaceVariant} />
                  <Text style={{ marginTop: 8, color: theme.colors.onSurfaceVariant }}>
                    No recent activity
                  </Text>
                </View>
              )}
            </Card.Content>
          </Card>
        </Animatable.View>

        {/* Quick Actions */}
        <Animatable.View animation="fadeInUp" duration={600} delay={800}>
          <Card>
            <Card.Content>
              <Title>Quick Actions</Title>
              <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 16 }}>
                <Button
                  mode="contained"
                  icon="microphone"
                  onPress={() => navigation.navigate('Recording' as never, { type: 'audio' } as never)}
                  style={{ flex: 1, marginRight: 8 }}
                >
                  Record Audio
                </Button>
                <Button
                  mode="outlined"
                  icon="video"
                  onPress={() => navigation.navigate('Recording' as never, { type: 'video' } as never)}
                  style={{ flex: 1, marginLeft: 8 }}
                >
                  Record Video
                </Button>
              </View>
            </Card.Content>
          </Card>
        </Animatable.View>

        {/* Add some bottom padding for the FAB */}
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="plus"
        style={{
          position: 'absolute',
          margin: 16,
          right: 0,
          bottom: 0,
          backgroundColor: theme.colors.primary,
        }}
        onPress={handleCreateCapsule}
      />
    </SafeAreaView>
  );
};

export default DashboardScreen;