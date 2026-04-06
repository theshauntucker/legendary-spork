import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../lib/auth';
import { getAuthToken } from '../../lib/api';
import { colors, gradients, gradientProps, glass, glassElevated, screenGradient, sectionHeader } from '../../lib/theme';

const API_BASE = process.env.EXPO_PUBLIC_API_BASE || 'https://routinex.org';

type AdminTab = 'overview' | 'members' | 'payments' | 'affiliates';

interface UserRecord {
  id: string;
  email: string;
  name?: string;
  created_at: string;
  last_sign_in_at?: string;
  totalCredits: number;
  usedCredits: number;
  remaining: number;
  paidAmount: number;
  analysisCount: number;
  isPaid: boolean;
}

interface PaymentRecord {
  id: string;
  user_id: string;
  payment_type: string;
  amount_cents: number;
  credits_granted: number;
  created_at: string;
  userEmail?: string;
}

interface AffiliateRecord {
  id: string;
  code: string;
  name: string;
  email?: string;
  revenue_share_pct: number;
  status: string;
  total_signups: number;
  total_revenue_cents: number;
  total_payout_cents: number;
  created_at: string;
}

export default function AdminScreen() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Data
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [affiliates, setAffiliates] = useState<AffiliateRecord[]>([]);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [creditInput, setCreditInput] = useState('');

  const loadData = useCallback(async () => {
    try {
      const token = await getAuthToken();
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch admin data from the website API
      const [usersRes, paymentsRes, affiliatesRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/users`, { headers }).catch(() => null),
        fetch(`${API_BASE}/api/admin/payments`, { headers }).catch(() => null),
        fetch(`${API_BASE}/api/admin/affiliates`, { headers }).catch(() => null),
      ]);

      if (usersRes?.ok) {
        const data = await usersRes.json();
        setUsers(data.users || []);
      }
      if (paymentsRes?.ok) {
        const data = await paymentsRes.json();
        setPayments(data.payments || []);
      }
      if (affiliatesRes?.ok) {
        const data = await affiliatesRes.json();
        setAffiliates(data.affiliates || []);
      }
    } catch (err) {
      console.error('Admin load failed:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const adjustCredits = async (userId: string, amount: number) => {
    try {
      const token = await getAuthToken();
      const res = await fetch(`${API_BASE}/api/admin/credits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId, amount }),
      });
      if (res.ok) {
        Alert.alert('Success', `Credits adjusted by ${amount > 0 ? '+' : ''}${amount}`);
        loadData();
      } else {
        Alert.alert('Error', 'Failed to adjust credits');
      }
    } catch {
      Alert.alert('Error', 'Network error');
    }
  };

  // Stats
  const totalRevenue = payments.reduce((sum, p) => sum + (p.amount_cents || 0), 0) / 100;
  const totalMembers = users.length;
  const paidMembers = users.filter(u => u.isPaid).length;
  const conversionRate = totalMembers > 0 ? Math.round((paidMembers / totalMembers) * 100) : 0;
  const singleSales = payments.filter(p => p.payment_type === 'single' || p.payment_type === 'iap_single');
  const packSales = payments.filter(p => p.payment_type === 'pack' || p.payment_type === 'video_analysis' || p.payment_type === 'iap_pack');

  if (loading) {
    return (
      <LinearGradient colors={screenGradient as unknown as string[]} {...gradientProps.topToBottom} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary[400]} />
        <Text style={{ color: colors.textSecondary, marginTop: 12 }}>Loading admin data...</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={screenGradient as unknown as string[]} {...gradientProps.topToBottom} style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary[400]} />}
      >
        {/* Tab Switcher */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
          {(['overview', 'members', 'payments', 'affiliates'] as AdminTab[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={{
                backgroundColor: activeTab === tab ? 'rgba(147,51,234,0.25)' : 'rgba(255,255,255,0.06)',
                borderRadius: 999,
                paddingVertical: 8,
                paddingHorizontal: 18,
                marginRight: 8,
                borderWidth: 1,
                borderColor: activeTab === tab ? colors.primary[600] : 'rgba(255,255,255,0.08)',
              }}
            >
              <Text style={{ color: activeTab === tab ? '#fff' : colors.textSecondary, fontSize: 13, fontWeight: '600', textTransform: 'capitalize' }}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <View>
            {/* Stats Cards */}
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
              {[
                { label: 'Revenue', value: `$${totalRevenue.toFixed(2)}`, color: colors.success },
                { label: 'Members', value: String(totalMembers), color: colors.primary[400] },
                { label: 'Conversion', value: `${conversionRate}%`, color: colors.gold[400] },
              ].map((stat) => (
                <View key={stat.label} style={{ flex: 1, ...glass, overflow: 'hidden' }}>
                  <LinearGradient colors={gradients.brand} {...gradientProps.leftToRight} style={{ height: 2 }} />
                  <View style={{ padding: 14, alignItems: 'center' }}>
                    <Text style={{ color: stat.color, fontSize: 20, fontWeight: '800' }}>{stat.value}</Text>
                    <Text style={{ color: colors.textSecondary, fontSize: 10, marginTop: 4 }}>{stat.label}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Revenue Breakdown */}
            <View style={{ ...glass, padding: 18, marginBottom: 16 }}>
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 12 }}>Revenue Breakdown</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Singles ($8.99)</Text>
                <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>{singleSales.length} sales</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Packs ($29.99)</Text>
                <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>{packSales.length} sales</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 8, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)' }}>
                <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Total Payments</Text>
                <Text style={{ color: colors.gold[400], fontSize: 13, fontWeight: '700' }}>{payments.length}</Text>
              </View>
            </View>

            {/* Recent Activity */}
            <Text style={{ ...sectionHeader, color: colors.primary[400] }}>Recent Activity</Text>
            {payments.slice(0, 10).map((p) => (
              <View key={p.id} style={{ ...glass, padding: 14, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>{p.userEmail || 'User'}</Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 11 }}>
                    {p.payment_type} - +{p.credits_granted} credits
                  </Text>
                </View>
                <Text style={{ color: colors.gold[400], fontSize: 13, fontWeight: '700' }}>
                  ${((p.amount_cents || 0) / 100).toFixed(2)}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* MEMBERS TAB */}
        {activeTab === 'members' && (
          <View>
            <Text style={{ color: colors.textSecondary, fontSize: 13, marginBottom: 12 }}>
              {totalMembers} members ({paidMembers} paid)
            </Text>
            {users.map((u) => (
              <View key={u.id} style={{ marginBottom: 10 }}>
                <TouchableOpacity
                  onPress={() => setExpandedUser(expandedUser === u.id ? null : u.id)}
                  style={{ ...glass, padding: 14 }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: u.isPaid ? colors.success : colors.textTertiary }} />
                        <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>{u.email}</Text>
                      </View>
                      <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 4 }}>
                        Joined {new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ color: u.remaining > 0 ? colors.success : colors.error, fontSize: 16, fontWeight: '800' }}>
                        {u.remaining}
                      </Text>
                      <Text style={{ color: colors.textTertiary, fontSize: 10 }}>credits</Text>
                    </View>
                  </View>
                </TouchableOpacity>

                {/* Expanded User Detail */}
                {expandedUser === u.id && (
                  <View style={{ ...glassElevated, padding: 16, marginTop: 4 }}>
                    <View style={{ flexDirection: 'row', gap: 10, marginBottom: 14 }}>
                      {[
                        { label: 'Total', value: u.totalCredits },
                        { label: 'Used', value: u.usedCredits },
                        { label: 'Left', value: u.remaining },
                      ].map((s) => (
                        <View key={s.label} style={{ flex: 1, alignItems: 'center', padding: 8, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 10 }}>
                          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>{s.value}</Text>
                          <Text style={{ color: colors.textTertiary, fontSize: 10 }}>{s.label}</Text>
                        </View>
                      ))}
                    </View>

                    <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: '600', marginBottom: 8 }}>Quick Adjust</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                      {[1, 3, 5, 10].map((n) => (
                        <TouchableOpacity
                          key={`+${n}`}
                          onPress={() => adjustCredits(u.id, n)}
                          style={{ backgroundColor: 'rgba(16,185,129,0.15)', borderRadius: 8, paddingVertical: 6, paddingHorizontal: 12 }}
                        >
                          <Text style={{ color: colors.success, fontSize: 12, fontWeight: '700' }}>+{n}</Text>
                        </TouchableOpacity>
                      ))}
                      {[1, 3].map((n) => (
                        <TouchableOpacity
                          key={`-${n}`}
                          onPress={() => adjustCredits(u.id, -n)}
                          style={{ backgroundColor: 'rgba(248,113,113,0.15)', borderRadius: 8, paddingVertical: 6, paddingHorizontal: 12 }}
                        >
                          <Text style={{ color: colors.error, fontSize: 12, fontWeight: '700' }}>-{n}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <TextInput
                        value={creditInput}
                        onChangeText={setCreditInput}
                        placeholder="Custom amount"
                        placeholderTextColor={colors.placeholder}
                        keyboardType="numeric"
                        style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 10, padding: 10, color: '#fff', fontSize: 14 }}
                      />
                      <TouchableOpacity
                        onPress={() => {
                          const amt = parseInt(creditInput);
                          if (!isNaN(amt)) {
                            adjustCredits(u.id, amt);
                            setCreditInput('');
                          }
                        }}
                        style={{ backgroundColor: 'rgba(147,51,234,0.25)', borderRadius: 10, paddingHorizontal: 16, justifyContent: 'center' }}
                      >
                        <Text style={{ color: colors.primary[400], fontWeight: '700', fontSize: 13 }}>Apply</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* PAYMENTS TAB */}
        {activeTab === 'payments' && (
          <View>
            <View style={{ ...glass, padding: 18, marginBottom: 16 }}>
              <Text style={{ color: colors.gold[400], fontSize: 24, fontWeight: '800' }}>${totalRevenue.toFixed(2)}</Text>
              <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 4 }}>Total Revenue</Text>
            </View>

            {payments.map((p) => (
              <View key={p.id} style={{ ...glass, padding: 14, marginBottom: 8 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>{p.userEmail || 'User'}</Text>
                    <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 2 }}>
                      {p.payment_type} | +{p.credits_granted} credits | {new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </Text>
                  </View>
                  <Text style={{ color: colors.success, fontSize: 14, fontWeight: '700' }}>
                    ${((p.amount_cents || 0) / 100).toFixed(2)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* AFFILIATES TAB */}
        {activeTab === 'affiliates' && (
          <View>
            {affiliates.length === 0 ? (
              <View style={{ ...glass, padding: 24, alignItems: 'center' }}>
                <Text style={{ color: colors.textSecondary, fontSize: 14 }}>No affiliates yet</Text>
              </View>
            ) : (
              affiliates.map((a) => (
                <View key={a.id} style={{ ...glass, padding: 16, marginBottom: 10 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <View style={{ backgroundColor: 'rgba(147,51,234,0.20)', borderRadius: 6, paddingVertical: 2, paddingHorizontal: 8 }}>
                          <Text style={{ color: colors.primary[400], fontSize: 12, fontWeight: '800', fontFamily: 'monospace' }}>{a.code}</Text>
                        </View>
                        <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>{a.name}</Text>
                      </View>
                      <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 6 }}>
                        {a.total_signups} signups | {a.revenue_share_pct}% share | {a.status}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ color: colors.gold[400], fontSize: 16, fontWeight: '800' }}>
                        ${((a.total_revenue_cents || 0) / 100).toFixed(2)}
                      </Text>
                      <Text style={{ color: colors.textTertiary, fontSize: 10 }}>revenue</Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}
