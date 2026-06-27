import { useNavigate } from 'react-router';
import { Users, Shield } from 'lucide-react';
import { Card } from '@/components/ui/card';

export function PortalSelection() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Mobile App Container */}
      <div className="max-w-md mx-auto w-full min-h-screen bg-background shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-br from-[#2563EB] to-[#1E40AF] px-6 py-12 rounded-b-[2rem]">
          <div className="text-center">
            <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              <span className="text-4xl">🏨</span>
            </div>
            <h1 className="text-white text-3xl mb-2">HostelPaglu</h1>
            <p className="text-white/90 text-sm">Smart Hostel Management</p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 px-6 py-8">
          <h2 className="text-xl text-foreground mb-2">Select Your Portal</h2>
          <p className="text-muted-foreground text-sm mb-8">Choose the portal you want to access</p>

          <div className="space-y-4">
            {/* Parent Portal Card */}
            <Card 
              className="bg-card border-border hover:border-primary transition-all cursor-pointer overflow-hidden shadow-sm"
              onClick={() => navigate('/parent')}
            >
              <div className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#2563EB] to-[#1E40AF] rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Users className="text-white" size={28} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg mb-1">Parent Portal</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Monitor your child's attendance, fees, leave requests, and hostel activities
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-secondary/30 px-6 py-3">
                <p className="text-secondary-foreground text-xs">Access dashboard, attendance tracking, and notifications →</p>
              </div>
            </Card>

            {/* Warden Portal Card */}
            <Card 
              className="bg-card border-border hover:border-primary transition-all cursor-pointer overflow-hidden shadow-sm"
              onClick={() => navigate('/warden')}
            >
              <div className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#14B8A6] to-[#0D9488] rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Shield className="text-white" size={28} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg mb-1">Warden Portal</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Manage students, rooms, attendance, complaints, and all hostel operations
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-accent/10 px-6 py-3">
                <p className="text-accent text-xs">Manage students, approvals, and hostel operations →</p>
              </div>
            </Card>
          </div>

          {/* Features */}
          <div className="mt-12 space-y-3">
            <h3 className="text-sm text-muted-foreground mb-4">What's Included</h3>
            {[
              'Real-time attendance tracking',
              'Leave management system',
              'Fee payment tracking',
              'Digital notice board',
              'Event gallery & updates',
            ].map((feature, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                <p className="text-sm text-foreground">{feature}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-6 border-t border-border">
          <p className="text-center text-xs text-muted-foreground">
            HostelPaglu v1.0 • Smart Hostel Management
          </p>
        </div>
      </div>
    </div>
  );
}
