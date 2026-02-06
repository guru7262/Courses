import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Calendar, BookOpen, Save, ArrowLeft, AlertCircle } from 'lucide-react';
import { Button } from '@/app/components/ui/button';

const API_BASE_URL = import.meta.env.VITE_API_URL as string;

interface ProfileData {
  username: string;
  email: string;
  profile: {
    fullName: string;
    age: string;
    gender: string;
    dateOfBirth: string;
    phoneNumber: string;
    bio: string;
    location: {
      city: string;
      state: string;
      country: string;
    };
  };
  education: {
    currentEducationLevel: string;
    institution: string;
    fieldOfStudy: string;
    graduationYear: string;
  };
}

export function EditProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState<ProfileData>({
    username: '',
    email: '',
    profile: {
      fullName: '',
      age: '',
      gender: '',
      dateOfBirth: '',
      phoneNumber: '',
      bio: '',
      location: {
        city: '',
        state: '',
        country: ''
      }
    },
    education: {
      currentEducationLevel: '',
      institution: '',
      fieldOfStudy: '',
      graduationYear: ''
    }
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const user = data.user;
        
        setFormData({
          username: user.username || '',
          email: user.email || '',
          profile: {
            fullName: user.profile?.fullName || '',
            age: user.profile?.age?.toString() || '',
            gender: user.profile?.gender || '',
            dateOfBirth: user.profile?.dateOfBirth ? new Date(user.profile.dateOfBirth).toISOString().split('T')[0] : '',
            phoneNumber: user.profile?.phoneNumber || '',
            bio: user.profile?.bio || '',
            location: {
              city: user.profile?.location?.city || '',
              state: user.profile?.location?.state || '',
              country: user.profile?.location?.country || ''
            }
          },
          education: {
            currentEducationLevel: user.education?.currentEducationLevel || '',
            institution: user.education?.institution || '',
            fieldOfStudy: user.education?.fieldOfStudy || '',
            graduationYear: user.education?.graduationYear?.toString() || ''
          }
        });
      } else if (response.status === 401) {
        navigate('/login');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Prepare data for submission
      const submitData = {
        profile: {
          fullName: formData.profile.fullName,
          age: formData.profile.age ? parseInt(formData.profile.age) : undefined,
          gender: formData.profile.gender || undefined,
          dateOfBirth: formData.profile.dateOfBirth || undefined,
          phoneNumber: formData.profile.phoneNumber || undefined,
          bio: formData.profile.bio || undefined,
          location: {
            city: formData.profile.location.city || undefined,
            state: formData.profile.location.state || undefined,
            country: formData.profile.location.country || undefined
          }
        },
        education: {
          currentEducationLevel: formData.education.currentEducationLevel || undefined,
          institution: formData.education.institution || undefined,
          fieldOfStudy: formData.education.fieldOfStudy || undefined,
          graduationYear: formData.education.graduationYear ? parseInt(formData.education.graduationYear) : undefined
        }
      };

      const response = await fetch(`${API_BASE_URL}/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
      });

      if (response.ok) {
        setSuccess('Profile updated successfully!');
        setTimeout(() => {
          navigate('/profile');
        }, 1500);
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('An error occurred while updating profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child, grandchild] = name.split('.');
      if (grandchild) {
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent as keyof ProfileData] as any,
            [child]: {
              ...(prev[parent as keyof ProfileData] as any)[child],
              [grandchild]: value
            }
          }
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent as keyof ProfileData] as any,
            [child]: value
          }
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-y-auto">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/profile')}
            className="mb-4 gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Profile
          </Button>
          <h1 className="text-3xl font-bold text-foreground">Edit Profile</h1>
          <p className="text-muted-foreground mt-2">
            Update your personal information and preferences
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-start gap-3">
            <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-green-500">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Information */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
              <User className="w-5 h-5" />
              Personal Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  disabled
                  className="w-full px-4 py-2 bg-muted border border-border rounded-lg text-muted-foreground cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Username cannot be changed here
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  disabled
                  className="w-full px-4 py-2 bg-muted border border-border rounded-lg text-muted-foreground cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Email cannot be changed here
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="profile.fullName"
                  value={formData.profile.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Age
                </label>
                <input
                  type="number"
                  name="profile.age"
                  value={formData.profile.age}
                  onChange={handleChange}
                  placeholder="Enter your age"
                  min="5"
                  max="120"
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Gender
                </label>
                <select
                  name="profile.gender"
                  value={formData.profile.gender}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="profile.dateOfBirth"
                  value={formData.profile.dateOfBirth}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="profile.phoneNumber"
                  value={formData.profile.phoneNumber}
                  onChange={handleChange}
                  placeholder="+1 234 567 8900"
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Bio
                </label>
                <textarea
                  name="profile.bio"
                  value={formData.profile.bio}
                  onChange={handleChange}
                  placeholder="Tell us about yourself..."
                  rows={4}
                  maxLength={500}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {formData.profile.bio.length}/500 characters
                </p>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Location
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  City
                </label>
                <input
                  type="text"
                  name="profile.location.city"
                  value={formData.profile.location.city}
                  onChange={handleChange}
                  placeholder="Enter city"
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  State/Province
                </label>
                <input
                  type="text"
                  name="profile.location.state"
                  value={formData.profile.location.state}
                  onChange={handleChange}
                  placeholder="Enter state"
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Country
                </label>
                <input
                  type="text"
                  name="profile.location.country"
                  value={formData.profile.location.country}
                  onChange={handleChange}
                  placeholder="Enter country"
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          {/* Education */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Education
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Education Level
                </label>
                <select
                  name="education.currentEducationLevel"
                  value={formData.education.currentEducationLevel}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select education level</option>
                  <option value="high-school">High School</option>
                  <option value="undergraduate">Undergraduate</option>
                  <option value="graduate">Graduate</option>
                  <option value="postgraduate">Postgraduate</option>
                  <option value="professional">Professional</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Institution
                </label>
                <input
                  type="text"
                  name="education.institution"
                  value={formData.education.institution}
                  onChange={handleChange}
                  placeholder="Enter institution name"
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Field of Study
                </label>
                <input
                  type="text"
                  name="education.fieldOfStudy"
                  value={formData.education.fieldOfStudy}
                  onChange={handleChange}
                  placeholder="e.g., Computer Science"
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Graduation Year
                </label>
                <input
                  type="number"
                  name="education.graduationYear"
                  value={formData.education.graduationYear}
                  onChange={handleChange}
                  placeholder="2024"
                  min="1950"
                  max="2050"
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/profile')}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="gap-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
