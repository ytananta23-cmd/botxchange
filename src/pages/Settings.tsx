import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Tabs, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Switch } from '../components/ui/switch';
import { ShieldAlert, AlertTriangle, Plus, Check } from 'lucide-react';
import { exchangeApi, authApi, usersApi } from '../api/client';
import { ConnectAccountModal } from '../components/ConnectAccountModal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useToast } from '../components/Toast';

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
};

export const Settings = () => {
  const { show } = useToast();
  const [activeTab, setActiveTab] = useState('api');
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [disconnectTarget, setDisconnectTarget] = useState<string | null>(null);

  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState('');
  const [language, setLanguage] = useState('en');
  const [oneClickTrading, setOneClickTrading] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (activeTab === 'api') {
      loadAccounts();
    }
    if (activeTab === 'personal') {
      loadUser();
    }
  }, [activeTab]);

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const data = await exchangeApi.getAccounts();
      setAccounts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadUser = async () => {
    try {
      const data = await authApi.getMe();
      setUser(data);
      setName(data?.name || '');
      setLanguage(data?.settings?.language || 'en');
      setOneClickTrading(!!data?.settings?.oneClickTrading);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    setProfileSaved(false);
    try {
      const updated = await usersApi.updateProfile({ name, language, oneClickTrading });
      setUser(updated);
      setProfileSaved(true);
      show('success', 'Profile updated');
      setTimeout(() => setProfileSaved(false), 2500);
    } catch (e: any) {
      show('error', 'Failed to save profile', e.message);
      console.error(e);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSaved(false);
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters.');
      return;
    }
    setSavingPassword(true);
    try {
      await usersApi.updatePassword({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setPasswordSaved(true);
      show('success', 'Password updated');
      setTimeout(() => setPasswordSaved(false), 2500);
    } catch (e: any) {
      setPasswordError(e.message || 'Failed to update password.');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleDisconnect = async (id: string) => {
    try {
      await exchangeApi.deleteAccount(id);
      show('info', 'Account disconnected');
      await loadAccounts();
    } catch (e: any) {
      show('error', 'Failed to disconnect', e.message);
      console.error(e);
    } finally {
      setDisconnectTarget(null);
    }
  };

  return (
    <motion.div initial="hidden" animate="show" variants={fadeUp} className="p-6 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-white/60 text-sm mt-1">Manage your account preferences and integrations.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto overflow-x-auto">
        <TabsTrigger value="personal">Personal</TabsTrigger>
        <TabsTrigger value="api">API Keys</TabsTrigger>
        <TabsTrigger value="billing">Subscription</TabsTrigger>
        <TabsTrigger value="other">Other</TabsTrigger>
      </Tabs>

      {activeTab === 'api' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
             <h2 className="text-lg font-semibold">Connected Exchange Accounts</h2>
             <Button variant="outline" size="sm" className="gap-2" onClick={() => setIsConnectModalOpen(true)}>
               <Plus className="w-4 h-4" /> Connect another account
             </Button>
          </div>

          <Card className="p-6 bg-red-500/10 border-red-500/20">
            <div className="flex gap-4 items-start">
              <ShieldAlert className="w-6 h-6 text-red-500 shrink-0 mt-1" />
              <div>
                <h3 className="text-red-500 font-semibold mb-1">Security Warning</h3>
                <p className="text-sm text-red-400/80 leading-relaxed">
                  When generating API keys on Delta Exchange India, ensure you <strong>ONLY</strong> check the "Trading" permissions.
                  <strong> NEVER enable "Withdrawal" permissions.</strong> BotXchange will never ask for withdrawal access to your funds.
                </p>
              </div>
            </div>
          </Card>

          {loading ? (
             <div className="p-12 text-center text-white/40">Loading accounts...</div>
          ) : accounts.length === 0 ? (
             <Card className="p-12 text-center border-dashed border-white/20 bg-[#15151F]">
                <h3 className="text-lg font-semibold mb-2">No connected accounts</h3>
                <p className="text-white/40 mb-6">Connect your exchange API keys to start trading.</p>
                <Button variant="gradient" onClick={() => setIsConnectModalOpen(true)}>Connect Account</Button>
             </Card>
          ) : (
            <Card className="p-6 bg-[#15151F] border-white/5 space-y-4">
               {accounts.map(account => (
                 <div key={account.id} className="flex items-center justify-between p-4 rounded-lg border border-white/10 bg-black/20">
                    <div className="flex items-center gap-4">
                       <Badge variant={account.type === 'demo' ? 'demo' : 'real'} className="uppercase shrink-0">{account.type}</Badge>
                       <div>
                          <div className="font-medium">{account.label}</div>
                          <div className="text-xs text-white/40">Connected on {new Date(account.createdAt || Date.now()).toLocaleDateString()}</div>
                       </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-500/10" onClick={() => setDisconnectTarget(account.id)}>
                      Disconnect
                    </Button>
                 </div>
               ))}
            </Card>
          )}

          <ConnectAccountModal
            open={isConnectModalOpen}
            onClose={() => setIsConnectModalOpen(false)}
            onSuccess={loadAccounts}
          />

          <ConfirmDialog
            open={!!disconnectTarget}
            title="Disconnect this account?"
            description="Active bots on this account may fail to place new orders. This won't cancel any existing orders on Delta Exchange."
            confirmLabel="Disconnect"
            onCancel={() => setDisconnectTarget(null)}
            onConfirm={() => disconnectTarget && handleDisconnect(disconnectTarget)}
          />
        </div>
      )}

      {activeTab === 'personal' && (
         <div className="space-y-6">
           <Card className="p-6 bg-[#15151F] border-white/5 space-y-6">
              <h3 className="font-semibold">Personal Information</h3>
              <div className="grid gap-4 max-w-md">
                 <div className="space-y-2">
                    <label className="text-sm text-white/60">Email Address</label>
                    <Input value={user?.email || ''} disabled />
                 </div>
                 <div className="space-y-2">
                    <label className="text-sm text-white/60">Display Name</label>
                    <Input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-sm text-white/60">Language</label>
                    <select
                      value={language}
                      onChange={e => setLanguage(e.target.value)}
                      className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-500/50 text-white"
                    >
                      <option value="en">English</option>
                      <option value="hi">Hindi</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                      <option value="ja">Japanese</option>
                    </select>
                 </div>
                 <div className="flex items-center justify-between rounded-lg border border-white/10 bg-black/20 px-4 py-3">
                    <div>
                      <div className="text-sm">One-click trading</div>
                      <div className="text-xs text-white/40 mt-0.5">Skip the confirmation prompt when placing orders on the Trade page.</div>
                    </div>
                    <Switch checked={oneClickTrading} onCheckedChange={setOneClickTrading} />
                 </div>
                 <div className="flex items-center gap-3">
                   <Button className="w-fit" variant="secondary" onClick={handleSaveProfile} disabled={savingProfile}>
                     {savingProfile ? 'Saving...' : 'Save Changes'}
                   </Button>
                   {profileSaved && <span className="text-sm text-green-400 flex items-center gap-1"><Check className="w-4 h-4" /> Saved</span>}
                 </div>
              </div>
           </Card>

           <Card className="p-6 bg-[#15151F] border-white/5 space-y-6">
              <h3 className="font-semibold">Change Password</h3>
              <form onSubmit={handleChangePassword} className="grid gap-4 max-w-md">
                 <div className="space-y-2">
                    <label className="text-sm text-white/60">Current Password</label>
                    <Input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required />
                 </div>
                 <div className="space-y-2">
                    <label className="text-sm text-white/60">New Password</label>
                    <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
                 </div>
                 {passwordError && <div className="text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{passwordError}</div>}
                 <div className="flex items-center gap-3">
                   <Button type="submit" className="w-fit" variant="secondary" disabled={savingPassword}>
                     {savingPassword ? 'Updating...' : 'Update Password'}
                   </Button>
                   {passwordSaved && <span className="text-sm text-green-400 flex items-center gap-1"><Check className="w-4 h-4" /> Updated</span>}
                 </div>
              </form>
           </Card>
         </div>
      )}

      {activeTab === 'billing' && (
         <Card className="p-6 bg-[#15151F] border-white/5 flex flex-col items-center justify-center text-center py-12">
            <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mb-4">
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-purple-400" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Free Plan</h3>
            <p className="text-white/60 mb-6 max-w-sm">You are currently using the free tier, which allows 1 active bot and demo trading.</p>
            <Button variant="gradient" onClick={() => show('info', 'Coming soon', 'Paid plans are launching soon.')}>Upgrade to Pro</Button>
         </Card>
      )}

       {activeTab === 'other' && (
         <>
         <Card className="p-6 bg-[#15151F] border-red-500/20">
            <h3 className="font-semibold text-red-500 mb-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4"/> Danger Zone</h3>
            <p className="text-sm text-white/60 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
            <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)}>Delete Account</Button>
         </Card>
         <ConfirmDialog
           open={showDeleteConfirm}
           title="Delete your account?"
           description="Account deletion isn't available yet from the app — contact support and we'll take care of it manually."
           confirmLabel="Contact Support"
           onCancel={() => setShowDeleteConfirm(false)}
           onConfirm={() => { setShowDeleteConfirm(false); show('info', 'Reach out to support to delete your account.'); }}
         />
         </>
      )}
    </motion.div>
  );
};
