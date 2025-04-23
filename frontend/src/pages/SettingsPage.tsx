
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import MainLayout from '@/components/layout/MainLayout';

const SettingsPage = () => {
  const { toast } = useToast();
  
  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    jobAlerts: true,
    messageNotifications: true,
    marketingEmails: false
  });
  
  // Connected accounts
  const [connectedAccounts, setConnectedAccounts] = useState({
    google: false,
    github: false,
    linkedin: false
  });
  
  const handleNotificationToggle = (setting: keyof typeof notificationSettings) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
    
    toast({
      title: "Setting updated",
      description: `${setting} has been ${notificationSettings[setting] ? 'disabled' : 'enabled'}.`
    });
  };

  const handleConnectAccount = (account: keyof typeof connectedAccounts) => {
    // In a real app, this would open OAuth flow
    setConnectedAccounts(prev => ({
      ...prev,
      [account]: true
    }));
    
    toast({
      title: "Account connected",
      description: `Your ${account} account has been successfully connected.`
    });
  };

  const handleDisconnectAccount = (account: keyof typeof connectedAccounts) => {
    setConnectedAccounts(prev => ({
      ...prev,
      [account]: false
    }));
    
    toast({
      title: "Account disconnected",
      description: `Your ${account} account has been disconnected.`
    });
  };

  const handleDeleteAccount = () => {
    // In a real app, this would call an API to delete the account
    toast({
      title: "Account deleted",
      description: "Your account has been successfully deleted.",
      variant: "destructive"
    });
    
    // Navigate to home page after account deletion
    setTimeout(() => {
      window.location.href = '/';
    }, 2000);
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>
        
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <Tabs defaultValue="notifications" className="p-6">
            <TabsList className="mb-6">
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="accounts">Connected Accounts</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>
            
            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">Notification Preferences</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Email Notifications</h3>
                    <p className="text-gray-500 text-sm">Receive emails for important account updates</p>
                  </div>
                  <Switch 
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={() => handleNotificationToggle('emailNotifications')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Job Alerts</h3>
                    <p className="text-gray-500 text-sm">Get notified about new job matches</p>
                  </div>
                  <Switch 
                    checked={notificationSettings.jobAlerts}
                    onCheckedChange={() => handleNotificationToggle('jobAlerts')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Message Notifications</h3>
                    <p className="text-gray-500 text-sm">Receive notifications for new messages</p>
                  </div>
                  <Switch 
                    checked={notificationSettings.messageNotifications}
                    onCheckedChange={() => handleNotificationToggle('messageNotifications')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Marketing Emails</h3>
                    <p className="text-gray-500 text-sm">Receive product updates and promotional offers</p>
                  </div>
                  <Switch 
                    checked={notificationSettings.marketingEmails}
                    onCheckedChange={() => handleNotificationToggle('marketingEmails')}
                  />
                </div>
              </div>
            </TabsContent>
            
            {/* Connected Accounts Tab */}
            <TabsContent value="accounts" className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">Connected Accounts</h2>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Google</h3>
                    <p className="text-gray-500 text-sm">
                      {connectedAccounts.google 
                        ? "Connected to your Google account" 
                        : "Connect to import contacts and use for login"}
                    </p>
                  </div>
                  {connectedAccounts.google ? (
                    <Button variant="outline" onClick={() => handleDisconnectAccount('google')}>
                      Disconnect
                    </Button>
                  ) : (
                    <Button onClick={() => handleConnectAccount('google')}>
                      Connect
                    </Button>
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">GitHub</h3>
                    <p className="text-gray-500 text-sm">
                      {connectedAccounts.github 
                        ? "Connected to your GitHub account" 
                        : "Connect to showcase your repositories and contributions"}
                    </p>
                  </div>
                  {connectedAccounts.github ? (
                    <Button variant="outline" onClick={() => handleDisconnectAccount('github')}>
                      Disconnect
                    </Button>
                  ) : (
                    <Button onClick={() => handleConnectAccount('github')}>
                      Connect
                    </Button>
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">LinkedIn</h3>
                    <p className="text-gray-500 text-sm">
                      {connectedAccounts.linkedin 
                        ? "Connected to your LinkedIn account" 
                        : "Connect to import your professional experience"}
                    </p>
                  </div>
                  {connectedAccounts.linkedin ? (
                    <Button variant="outline" onClick={() => handleDisconnectAccount('linkedin')}>
                      Disconnect
                    </Button>
                  ) : (
                    <Button onClick={() => handleConnectAccount('linkedin')}>
                      Connect
                    </Button>
                  )}
                </div>
              </div>
            </TabsContent>
            
            {/* Security Tab */}
            <TabsContent value="security" className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">Security Settings</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Change Password</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="current-password">Current Password</Label>
                      <Input id="current-password" type="password" />
                    </div>
                    <div>
                      <Label htmlFor="new-password">New Password</Label>
                      <Input id="new-password" type="password" />
                    </div>
                    <div>
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <Input id="confirm-password" type="password" />
                    </div>
                    <Button>Update Password</Button>
                  </div>
                </div>
                
                <div className="pt-6 border-t">
                  <h3 className="font-medium text-gray-900 mb-4">Delete Account</h3>
                  <p className="text-gray-600 mb-4">
                    Once you delete your account, there is no going back. This action is permanent and cannot be undone.
                  </p>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">Delete Account</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your account
                          and remove your data from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteAccount} className="bg-red-600 hover:bg-red-700">
                          Delete Account
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
};

export default SettingsPage;
