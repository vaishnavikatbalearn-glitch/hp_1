import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, User, Phone, Shield, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function WardenParentPhotoView() {
  const navigate = useNavigate();
  const { id } = useParams();

  const parentData = {
    name: 'Mr. Rajesh Sharma',
    relation: 'Father',
    phone: '+91 98765 12345',
    email: 'rajesh.sharma@email.com',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
    guardianName: 'Mrs. Sunita Sharma',
    guardianPhone: '+91 98765 67890',
    guardianPhoto: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
    verificationStatus: 'Verified',
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="max-w-md mx-auto w-full min-h-screen bg-background shadow-2xl flex flex-col">
        <div className="bg-gradient-to-br from-[#14B8A6] to-[#0D9488] px-4 py-4 sticky top-0 z-50 shadow-lg">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate(`/warden/students/${id}`)}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all backdrop-blur-sm"
            >
              <ArrowLeft className="text-white" size={20} />
            </button>
            <h1 className="text-white text-lg">Parent Photo View</h1>
          </div>
        </div>

        <div className="flex-1 overflow-auto pb-6 px-6 py-6">
          <Card className="bg-amber-50 border-amber-200 mb-6">
            <div className="p-4 flex items-start space-x-3">
              <Shield className="text-amber-600" size={20} />
              <div>
                <p className="text-sm mb-1">Security Notice</p>
                <p className="text-xs text-muted-foreground">Parent photos are visible only to warden/admin for security verification purposes.</p>
              </div>
            </div>
          </Card>

          <Card className="bg-card border-border mb-6">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base">Parent / Father</h3>
                <Badge className="bg-green-500 text-white">
                  <CheckCircle size={12} className="mr-1" />
                  {parentData.verificationStatus}
                </Badge>
              </div>
              <div className="flex flex-col items-center mb-4">
                <Avatar className="w-32 h-32 border-4 border-secondary mb-4">
                  <AvatarImage src={parentData.photo} />
                  <AvatarFallback>{parentData.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <h4 className="text-base mb-1">{parentData.name}</h4>
                <p className="text-sm text-muted-foreground mb-4">{parentData.relation}</p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Phone className="text-blue-600" size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="text-sm">{parentData.phone}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-card border-border">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base">Guardian / Mother</h3>
                <Badge className="bg-green-500 text-white">
                  <CheckCircle size={12} className="mr-1" />
                  Verified
                </Badge>
              </div>
              <div className="flex flex-col items-center mb-4">
                <Avatar className="w-32 h-32 border-4 border-secondary mb-4">
                  <AvatarImage src={parentData.guardianPhoto} />
                  <AvatarFallback>{parentData.guardianName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <h4 className="text-base mb-1">{parentData.guardianName}</h4>
                <p className="text-sm text-muted-foreground mb-4">Mother</p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Phone className="text-blue-600" size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="text-sm">{parentData.guardianPhone}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
