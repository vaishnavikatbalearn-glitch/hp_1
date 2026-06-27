import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Camera, CheckCircle, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export function WardenFaceEnrollment() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [enrollmentProgress, setEnrollmentProgress] = useState(75);

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
            <h1 className="text-white text-lg">Face Enrollment</h1>
          </div>
        </div>

        <div className="flex-1 overflow-auto pb-6 px-6 py-6">
          <Card className="bg-card border-border mb-6">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base">Enrollment Status</h3>
                <Badge className="bg-green-500 text-white">
                  <CheckCircle size={12} className="mr-1" />
                  Active
                </Badge>
              </div>
              
              <div className="w-full aspect-square bg-muted rounded-2xl flex items-center justify-center mb-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <Camera className="text-muted-foreground" size={64} />
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Enrollment Progress</span>
                  <span className="text-sm">{enrollmentProgress}%</span>
                </div>
                <Progress value={enrollmentProgress} className="h-2" />
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="text-green-600" size={18} />
                  <span className="text-sm">Front face captured</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="text-green-600" size={18} />
                  <span className="text-sm">Left profile captured</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="text-green-600" size={18} />
                  <span className="text-sm">Right profile captured</span>
                </div>
                <div className="flex items-center space-x-3">
                  <AlertCircle className="text-amber-600" size={18} />
                  <span className="text-sm">Verification pending</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="w-full">
                  Re-enroll
                </Button>
                <Button className="w-full bg-primary hover:bg-primary/90 text-white">
                  Verify
                </Button>
              </div>
            </div>
          </Card>

          <Card className="bg-blue-50 border-blue-200">
            <div className="p-4">
              <h4 className="text-sm mb-2">Enrollment Instructions</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Ensure good lighting conditions</li>
                <li>• Student should look directly at camera</li>
                <li>• Remove glasses if wearing any</li>
                <li>• Maintain neutral expression</li>
              </ul>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
