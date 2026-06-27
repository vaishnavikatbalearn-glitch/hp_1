import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Bell, User, Moon, LogOut, ChevronRight, Mail, Phone, Lock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

export function ParentSettings() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const parentData = {
    name: "Mr. Rajesh Sharma",
    email: "rajesh.sharma@email.com",
    phone: "+91 98765 43210",
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="max-w-md mx-auto w-full min-h-screen bg-background shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-br from-[#2563EB] to-[#1E40AF] px-4 py-4 pb-20 sticky top-0 z-50 shadow-lg">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/parent')}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all backdrop-blur-sm"
            >
              <ArrowLeft className="text-white" size={20} />
            </button>
            <h1 className="text-white text-lg">Settings</h1>
          </div>
        </div>

        {/* Profile Card */}
        <div className="px-6 -mt-12 mb-6 relative z-10">
          <Card className="bg-card border-border shadow-xl">
            <div className="p-5">
              <div className="flex items-center space-x-4">
                <Avatar className="w-16 h-16 border-2 border-secondary">
                  <AvatarImage src={parentData.photo} />
                  <AvatarFallback>RS</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h2 className="text-base mb-1">{parentData.name}</h2>
                  <p className="text-sm text-muted-foreground">{parentData.email}</p>
                </div>
                <ChevronRight className="text-muted-foreground" size={20} />
              </div>
            </div>
          </Card>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto pb-6">
          {/* Account Section */}
          <div className="px-6 mb-6">
            <h3 className="text-sm text-muted-foreground mb-3">ACCOUNT</h3>
            <Card className="bg-card border-border">
              <div className="divide-y divide-border">
                <button className="w-full p-4 flex items-center space-x-3 hover:bg-muted/50 transition-colors">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <User className="text-blue-600" size={20} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm mb-1">Edit Profile</p>
                    <p className="text-xs text-muted-foreground">Update your personal information</p>
                  </div>
                  <ChevronRight className="text-muted-foreground" size={20} />
                </button>

                <button className="w-full p-4 flex items-center space-x-3 hover:bg-muted/50 transition-colors">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Lock className="text-purple-600" size={20} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm mb-1">Change Password</p>
                    <p className="text-xs text-muted-foreground">Update your password</p>
                  </div>
                  <ChevronRight className="text-muted-foreground" size={20} />
                </button>
              </div>
            </Card>
          </div>

          {/* Notification Settings */}
          <div className="px-6 mb-6">
            <h3 className="text-sm text-muted-foreground mb-3">NOTIFICATIONS</h3>
            <Card className="bg-card border-border">
              <div className="divide-y divide-border">
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                      <Bell className="text-red-600" size={20} />
                    </div>
                    <div>
                      <p className="text-sm mb-1">Push Notifications</p>
                      <p className="text-xs text-muted-foreground">Receive app notifications</p>
                    </div>
                  </div>
                  <Switch checked={notifications} onCheckedChange={setNotifications} />
                </div>

                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Mail className="text-blue-600" size={20} />
                    </div>
                    <div>
                      <p className="text-sm mb-1">Email Alerts</p>
                      <p className="text-xs text-muted-foreground">Receive email notifications</p>
                    </div>
                  </div>
                  <Switch checked={emailAlerts} onCheckedChange={setEmailAlerts} />
                </div>

                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                      <Phone className="text-green-600" size={20} />
                    </div>
                    <div>
                      <p className="text-sm mb-1">SMS Alerts</p>
                      <p className="text-xs text-muted-foreground">Receive SMS notifications</p>
                    </div>
                  </div>
                  <Switch checked={smsAlerts} onCheckedChange={setSmsAlerts} />
                </div>
              </div>
            </Card>
          </div>

          {/* Preferences */}
          <div className="px-6 mb-6">
            <h3 className="text-sm text-muted-foreground mb-3">PREFERENCES</h3>
            <Card className="bg-card border-border">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <Moon className="text-indigo-600" size={20} />
                  </div>
                  <div>
                    <p className="text-sm mb-1">Dark Mode</p>
                    <p className="text-xs text-muted-foreground">Enable dark theme</p>
                  </div>
                </div>
                <Switch checked={darkMode} onCheckedChange={setDarkMode} />
              </div>
            </Card>
          </div>

          {/* Logout */}
          <div className="px-6 mb-6">
            <Button 
              variant="outline" 
              className="w-full border-destructive text-destructive hover:bg-destructive hover:text-white"
              onClick={() => navigate('/')}
            >
              <LogOut className="mr-2" size={18} />
              Logout
            </Button>
          </div>

          {/* App Info */}
          <div className="px-6 text-center">
            <p className="text-xs text-muted-foreground mb-1">HostelPaglu Parent Portal</p>
            <p className="text-xs text-muted-foreground">Version 1.0.0</p>
          </div>
        </div>
      </div>
    </div>
  );
}
