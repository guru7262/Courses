import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Mail, Calendar, MapPin, BookOpen, Award,
  TrendingUp, Clock, Target, Edit, Settings,
  Video, FileText, ClipboardCheck, Flame, Map, ChevronRight,
  BarChart2, Activity
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { Button } from '@/app/components/ui/button';
import { Navbar } from '@/app/components/UpdatedNavbar';

const API_BASE_URL = import.meta.env.VITE_API_URL as string;

interface UserProfile {
  _id: string;
  username: string;
  email: string;
  isVerified: boolean;
  profile: {
    fullName?: string;
    age?: number;
    gender?: string;
    dateOfBirth?: string;
    phoneNumber?: string;
    bio?: string;
    location?: {
      city?: string;
      state?: string;
      country?: string;
    };
    profilePicture?: string;
  };
  education?: {
    currentEducationLevel?: string;
    institution?: string;
    fieldOfStudy?: string;
    graduationYear?: number;
  };
  activityStats: {
    totalVideosWatched: number;
    totalNotesCreated: number;
    totalQuizzesTaken: number;
    totalStudyHours: number;
    currentStreak: number;
    longestStreak: number;
  };
  achievements: Array<{
    badgeName: string;
    badgeIcon: string;
    description: string;
    earnedAt: string;
  }>;
  enrolledSubjects: Array<{
    subjectId: {
      name: string;
    };
    progress: number;
    enrolledAt: string;
  }>;
  createdAt: string;
  lastLogin?: string;
}

export function ProfileDashboard() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
    fetchPathway();
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
        setProfile(data.user);
      } else if (response.status === 401) {
        navigate('/login');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  // Pathway data
  const [pathwayData, setPathwayData] = useState<any>(null);
  const [pathwayLoading, setPathwayLoading] = useState(true);

  const fetchPathway = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) { setPathwayLoading(false); return; }
      const res = await fetch(`${API_BASE_URL}/pathway`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPathwayData(data.pathway);
      }
    } catch {
      // Try localStorage fallback
      try {
        const cached = localStorage.getItem('coursePathway');
        if (cached) setPathwayData(JSON.parse(cached));
      } catch { /* ignore */ }
    } finally {
      setPathwayLoading(false);
    }
  };

  const getInitials = () => {
    if (profile?.profile?.fullName) {
      return profile.profile.fullName
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return profile?.username?.slice(0, 2).toUpperCase() || 'U';
  };

  const getMockAccuracyData = () => {
    if (!pathwayData || !pathwayData.steps) return [];

    const accuracyData: any[] = [];
    pathwayData.steps.forEach((step: any) => {
      step.subjectBlocks.forEach((block: any) => {
        if (block.mockTest && block.mockTest.status === 'completed' && block.mockTest.result) {
          accuracyData.push({
            name: block.subjectName.length > 12 ? block.subjectName.substring(0, 10) + '...' : block.subjectName,
            topic: block.topicName,
            accuracy: block.mockTest.result.scorePercent,
            date: new Date(block.mockTest.result.attemptedAt).toLocaleDateString(),
            fullSubject: block.subjectName
          });
        }
      });
    });
    return accuracyData;
  };

  const mockStats = getMockAccuracyData();

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getEducationLevelLabel = (level?: string) => {
    const labels: Record<string, string> = {
      'high-school': 'High School',
      'undergraduate': 'Undergraduate',
      'graduate': 'Graduate',
      'postgraduate': 'Postgraduate',
      'professional': 'Professional',
      'other': 'Other'
    };
    return level ? labels[level] || level : 'Not set';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Failed to load profile</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-y-auto">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Header Section */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl p-8 mb-8 border border-border">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Profile Picture */}
            <div className="relative">
              {profile.profile?.profilePicture ? (
                <img
                  src={profile.profile.profilePicture}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-4 border-primary/20"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-3xl font-bold border-4 border-primary/20">
                  {getInitials()}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full border-4 border-background flex items-center justify-center">
                {profile.isVerified && (
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-foreground mb-1">
                {profile.profile?.fullName || profile.username}
              </h1>
              <p className="text-muted-foreground mb-3">@{profile.username}</p>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>{profile.email}</span>
                </div>
                {profile.profile?.location?.city && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>
                      {profile.profile.location.city}
                      {profile.profile.location.country && `, ${profile.profile.location.country}`}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {formatDate(profile.createdAt)}</span>
                </div>
              </div>

              {profile.profile?.bio && (
                <p className="mt-4 text-foreground">{profile.profile.bio}</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2">
              <Button
                onClick={() => navigate('/profile/edit')}
                className="gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit Profile
              </Button>
              <Button
                onClick={() => navigate('/profile/settings')}
                variant="outline"
                className="gap-2"
              >
                <Settings className="w-4 h-4" />
                Settings
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Videos Watched */}
          <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <Video className="w-6 h-6 text-blue-500" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-1">
              {profile.activityStats.totalVideosWatched}
            </h3>
            <p className="text-sm text-muted-foreground">Videos Watched</p>
          </div>

          {/* Notes Read */}
          <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <FileText className="w-6 h-6 text-purple-500" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-1">
              {profile.activityStats.totalNotesCreated}
            </h3>
            <p className="text-sm text-muted-foreground">Notes Read</p>
          </div>

          {/* Quizzes Taken */}
          <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-500/10 rounded-lg">
                <ClipboardCheck className="w-6 h-6 text-orange-500" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-1">
              {profile.activityStats.totalQuizzesTaken}
            </h3>
            <p className="text-sm text-muted-foreground">Quizzes Taken</p>
          </div>

          {/* Current Streak */}
          <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-red-500/10 rounded-lg">
                <Flame className="w-6 h-6 text-red-500" />
              </div>
              <span className="text-xs text-muted-foreground">
                Best: {profile.activityStats.longestStreak}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-1">
              {profile.activityStats.currentStreak} days
            </h3>
            <p className="text-sm text-muted-foreground">Current Streak</p>
          </div>
        </div>

        {/* Performance Visualization Section */}
        {mockStats.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-6 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-green-500/10 rounded-lg">
                <BarChart2 className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">Performance Trend</h2>
                <p className="text-xs text-muted-foreground">Accuracy across your mock tests</p>
              </div>
            </div>

            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockStats}>
                  <defs>
                    <linearGradient id="colorAccuracy" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#888888" opacity={0.2} />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#888888', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    domain={[0, 100]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#888888', fontSize: 12 }}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      borderColor: '#374151',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: '#f3f4f6'
                    }}
                    itemStyle={{ color: '#818cf8' }}
                    labelStyle={{ fontWeight: 'bold', marginBottom: '4px', color: '#ffffff' }}
                    formatter={(value: number) => [`${value}%`, 'Accuracy']}
                    labelFormatter={(label, payload) => {
                      if (payload && payload.length > 0) {
                        return `${payload[0].payload.fullSubject} - ${payload[0].payload.topic}`;
                      }
                      return label;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="accuracy"
                    stroke="none"
                    fillOpacity={1}
                    fill="url(#colorAccuracy)"
                  />
                  <Line
                    type="monotone"
                    dataKey="accuracy"
                    stroke="#6366f1"
                    strokeWidth={3}
                    dot={{ r: 5, fill: '#6366f1', strokeWidth: 2, stroke: '#ffffff' }}
                    activeDot={{ r: 7, strokeWidth: 0, fill: '#818cf8' }}
                    animationDuration={1500}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Course Pathway Section */}
        <div className="mb-8">
          {pathwayLoading ? (
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="h-6 w-40 bg-muted rounded animate-pulse mb-4" />
              <div className="h-3 w-full bg-muted rounded-full animate-pulse mb-3" />
              <div className="h-4 w-32 bg-muted rounded animate-pulse" />
            </div>
          ) : pathwayData ? (
            <div className="bg-gradient-to-r from-indigo-500/10 via-primary/5 to-transparent border border-indigo-500/20 rounded-xl p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-500/20 rounded-lg">
                    <Map className="w-5 h-5 text-indigo-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-foreground">
                      {pathwayData.targets?.categoryName || 'Course'} Pathway
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Step {Math.min(pathwayData.currentStepIndex + 1, pathwayData.totalSteps)} of {pathwayData.totalSteps}
                      {pathwayData.overallStatus === 'completed' && ' · Complete! 🎉'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/pathway')}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border border-border text-foreground hover:bg-muted transition-colors"
                >
                  View Pathway <ChevronRight className="h-3 w-3" />
                </button>
              </div>

              {/* Progress bar */}
              <div className="mb-3">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Overall Progress</span>
                  <span>{pathwayData.overallProgressPercent || 0}%</span>
                </div>
                <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${pathwayData.overallStatus === 'completed' ? 'bg-emerald-500' : 'bg-indigo-500'
                      }`}
                    style={{ width: `${pathwayData.overallProgressPercent || 0}%` }}
                  />
                </div>
              </div>

              {/* Targets row */}
              <div className="grid grid-cols-3 gap-3 mt-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-foreground">{pathwayData.targets?.subjectsPerDay || '-'}</div>
                  <div className="text-xs text-muted-foreground">Subjects/day</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-foreground">{pathwayData.targets?.hoursPerDay || '-'}h</div>
                  <div className="text-xs text-muted-foreground">Hours/day</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-foreground">
                    {pathwayData.steps?.filter((s: any) => s.status === 'completed').length || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">Steps done</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-card border border-dashed border-border rounded-xl p-6 text-center">
              <Map className="w-8 h-8 mx-auto text-muted-foreground mb-2 opacity-60" />
              <p className="text-sm text-muted-foreground mb-3">No course pathway set up yet</p>
              <button
                onClick={() => navigate('/pathway')}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
              >
                Set Up Pathway
              </button>
            </div>
          )}
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - About & Education */}
          <div className="lg:col-span-2 space-y-6">
            {/* About Section */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                About
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Age</p>
                  <p className="text-foreground font-medium">
                    {profile.profile?.age || 'Not set'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Gender</p>
                  <p className="text-foreground font-medium capitalize">
                    {profile.profile?.gender?.replace('-', ' ') || 'Not set'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Date of Birth</p>
                  <p className="text-foreground font-medium">
                    {formatDate(profile.profile?.dateOfBirth)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Phone</p>
                  <p className="text-foreground font-medium">
                    {profile.profile?.phoneNumber || 'Not set'}
                  </p>
                </div>
              </div>
            </div>

            {/* Education Section */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">

                Education
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Education Level</p>
                  <p className="text-foreground font-medium">
                    {getEducationLevelLabel(profile.education?.currentEducationLevel)}
                  </p>
                </div>
                {profile.education?.institution && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Institution</p>
                    <p className="text-foreground font-medium">
                      {profile.education.institution}
                    </p>
                  </div>
                )}
                {profile.education?.fieldOfStudy && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Field of Study</p>
                    <p className="text-foreground font-medium">
                      {profile.education.fieldOfStudy}
                    </p>
                  </div>
                )}
                {profile.education?.graduationYear && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Graduation Year</p>
                    <p className="text-foreground font-medium">
                      {profile.education.graduationYear}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Enrolled Subjects */}
            {profile.enrolledSubjects && profile.enrolledSubjects.length > 0 && (
              <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Enrolled Subjects
                </h2>
                <div className="space-y-4">
                  {profile.enrolledSubjects.map((subject, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-foreground font-medium">
                          {subject.subjectId?.name || 'Unknown Subject'}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {subject.progress}%
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary rounded-full h-2 transition-all"
                          style={{ width: `${subject.progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Achievements & Activity */}
          <div className="space-y-6">
            {/* Study Time */}
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-primary/20 rounded-lg">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground">
                    {profile.activityStats.totalStudyHours}h
                  </h3>
                  <p className="text-sm text-muted-foreground">Total Study Time</p>
                </div>
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Award className="w-5 h-5" />
                Achievements
                <span className="ml-auto text-sm font-normal text-muted-foreground">
                  {profile.achievements?.length || 0}
                </span>
              </h2>

              {profile.achievements && profile.achievements.length > 0 ? (
                <div className="space-y-3">
                  {profile.achievements.slice(0, 5).map((achievement, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                    >
                      <div className="text-2xl">{achievement.badgeIcon || '🏆'}</div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground text-sm">
                          {achievement.badgeName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {achievement.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Award className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-sm text-muted-foreground">
                    No achievements yet
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Keep learning to earn badges!
                  </p>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-xl font-bold text-foreground mb-4">Quick Stats</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Member since</span>
                  <span className="text-foreground font-medium">
                    {new Date(profile.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                {profile.lastLogin && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Last login</span>
                    <span className="text-foreground font-medium">
                      {new Date(profile.lastLogin).toLocaleDateString()}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Account status</span>
                  <span className="text-green-500 font-medium flex items-center gap-1">
                    {profile.isVerified ? (
                      <>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Verified
                      </>
                    ) : (
                      'Not Verified'
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
