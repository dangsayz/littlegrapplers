'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';

// Format phone number as user types: 000-000-0000
function formatPhoneInput(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
}

// Character limits
const LIMITS = {
  name: 100,
  email: 254,
  phone: 12,
  medicalInfo: 500,
};
import { 
  User, 
  Baby, 
  MapPin, 
  Phone, 
  AlertCircle, 
  ChevronRight, 
  ChevronLeft,
  Check,
  Shirt,
  Megaphone,
  FileCheck,
  Sparkles,
  X
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

/**
 * Motion Design System Tokens
 * Following MOTION-SYSTEM.md guidelines:
 * - GPU-only transforms (transform, opacity)
 * - Purpose: reveal, guide, reward
 * - Reduced motion support via framer-motion
 */
const MOTION = {
  fast: 0.15,
  normal: 0.3,
  slow: 0.5,
  easeOutExpo: [0.16, 1, 0.3, 1] as const,
  stagger: 0.06,
};

const stepVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 30 : -30,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 30 : -30,
    opacity: 0,
  }),
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: MOTION.stagger,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: MOTION.normal,
      ease: MOTION.easeOutExpo,
    },
  },
};

interface Location {
  id: string;
  name: string;
  slug: string;
}

const STEPS = [
  { id: 1, title: 'Parent Info', icon: User },
  { id: 2, title: 'Student Info', icon: Baby },
  { id: 3, title: 'Additional Info', icon: FileCheck },
];

const T_SHIRT_SIZES = [
  { value: 'YXS', label: 'Youth XS' },
  { value: 'YS', label: 'Youth Small' },
  { value: 'YM', label: 'Youth Medium' },
  { value: 'YL', label: 'Youth Large' },
  { value: 'YXL', label: 'Youth XL' },
  { value: 'AS', label: 'Adult Small' },
  { value: 'AM', label: 'Adult Medium' },
];

const HOW_HEARD_OPTIONS = [
  { value: 'facebook', label: 'Facebook' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'google', label: 'Google Search' },
  { value: 'friend', label: 'Friend/Family Referral' },
  { value: 'daycare', label: 'Daycare/School' },
  { value: 'flyer', label: 'Flyer/Poster' },
  { value: 'other', label: 'Other' },
];

const STORAGE_KEY = 'littlegrapplers_onboarding_draft';

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);
  const [error, setError] = useState('');
  const [hasRestoredDraft, setHasRestoredDraft] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    studentFirstName: '',
    studentLastName: '',
    studentDob: '',
    locationId: '',
    medicalConditions: '',
    tshirtSize: '',
    howHeard: '',
    photoConsent: false,
    waiverAccepted: false,
  });

  // Fetch prefill data from existing waiver/user records
  useEffect(() => {
    const fetchPrefillData = async () => {
      try {
        const res = await fetch('/api/onboarding/prefill');
        if (res.ok) {
          const data = await res.json();
          if (data.prefill) {
            setFormData((prev) => ({
              ...prev,
              firstName: data.prefill.firstName || prev.firstName || '',
              lastName: data.prefill.lastName || prev.lastName || '',
              phone: data.prefill.phone || prev.phone || '',
              emergencyContactName: data.prefill.emergencyContactName || prev.emergencyContactName || '',
              emergencyContactPhone: data.prefill.emergencyContactPhone || prev.emergencyContactPhone || '',
              studentFirstName: data.prefill.studentFirstName || prev.studentFirstName || '',
              studentLastName: data.prefill.studentLastName || prev.studentLastName || '',
              studentDob: data.prefill.studentDob || prev.studentDob || '',
              locationId: data.prefill.locationId || prev.locationId || '',
              howHeard: data.prefill.howHeard || prev.howHeard || '',
              photoConsent: data.prefill.photoConsent ?? prev.photoConsent,
            }));
          }
        }
      } catch (err) {
        console.error('Error fetching prefill data:', err);
      }
    };

    if (isLoaded && user) {
      // First set from Clerk user, then fetch additional prefill data
      setFormData((prev) => ({
        ...prev,
        firstName: user.firstName || prev.firstName || '',
        lastName: user.lastName || prev.lastName || '',
      }));
      fetchPrefillData();
    }
  }, [isLoaded, user]);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await fetch('/api/locations/list');
        if (res.ok) {
          const data = await res.json();
          setLocations(data.locations || []);
        }
      } catch (err) {
        console.error('Error fetching locations:', err);
      }
    };
    fetchLocations();
  }, []);

  // Auto-save to localStorage whenever form data changes
  useEffect(() => {
    if (hasRestoredDraft) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          formData,
          currentStep,
          savedAt: new Date().toISOString(),
        }));
      } catch (err) {
        console.error('Failed to save draft:', err);
      }
    }
  }, [formData, currentStep, hasRestoredDraft]);

  // Restore from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.formData) {
          setFormData((prev) => ({
            ...prev,
            ...parsed.formData,
          }));
          if (parsed.currentStep) {
            setCurrentStep(parsed.currentStep);
          }
        }
      }
    } catch (err) {
      console.error('Failed to restore draft:', err);
    }
    setHasRestoredDraft(true);
  }, []);

  // Clear saved draft on successful submission
  const clearSavedDraft = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.error('Failed to clear draft:', err);
    }
  };

  const updateField = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError('');
  };

  const handlePhoneChange = (field: 'phone' | 'emergencyContactPhone') => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    updateField(field, formatPhoneInput(e.target.value));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.firstName || !formData.lastName || !formData.phone) {
          setError('Please fill in all required fields');
          return false;
        }
        // Validate phone format
        if (!/^\d{3}-\d{3}-\d{4}$/.test(formData.phone)) {
          setError('Please enter a valid phone number (000-000-0000)');
          return false;
        }
        if (!formData.emergencyContactName || !formData.emergencyContactPhone) {
          setError('Emergency contact information is required');
          return false;
        }
        if (!/^\d{3}-\d{3}-\d{4}$/.test(formData.emergencyContactPhone)) {
          setError('Please enter a valid emergency contact phone (000-000-0000)');
          return false;
        }
        return true;
      case 2:
        if (!formData.studentFirstName || !formData.studentLastName || !formData.studentDob) {
          setError('Please fill in all student information');
          return false;
        }
        if (!formData.locationId) {
          setError('Please select a location');
          return false;
        }
        return true;
      case 3:
        if (!formData.waiverAccepted) {
          setError('You must accept the liability waiver to continue');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setDirection(1);
      setCurrentStep((prev) => Math.min(prev + 1, 3));
    }
  };

  const prevStep = () => {
    setDirection(-1);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    setError('');
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        clearSavedDraft();
        setIsComplete(true);
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to complete onboarding');
        setIsSubmitting(false);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Success screen - Purpose: REWARD
  if (isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand/5 via-background to-background flex items-center justify-center px-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 80, damping: 10 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
            className="w-20 h-20 bg-brand rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Check className="h-10 w-10 text-white" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: MOTION.normal }}
            className="text-2xl font-display font-bold text-foreground mb-2"
          >
            Welcome to the Family!
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: MOTION.normal }}
            className="text-muted-foreground flex items-center justify-center gap-2"
          >
            <Sparkles className="h-4 w-4 text-brand" />
            Setting up your dashboard...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand/5 via-background to-background py-12 px-4">
      {/* Skip/Close Button */}
      <button
        onClick={() => router.push('/dashboard')}
        className="fixed top-4 right-4 z-50 p-2 rounded-full bg-white/80 backdrop-blur border border-gray-200 shadow-sm hover:bg-gray-100 transition-colors group"
        title="Skip onboarding"
      >
        <X className="h-5 w-5 text-gray-500 group-hover:text-gray-700" />
      </button>

      <motion.div 
        className="max-w-2xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: MOTION.slow, ease: MOTION.easeOutExpo }}
      >
        {/* Header - Purpose: REVEAL */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: MOTION.normal, ease: MOTION.easeOutExpo }}
        >
          <h1 className="text-3xl font-display font-bold text-foreground">
            Welcome to <span className="text-brand">Little Grapplers</span>
          </h1>
          <p className="text-muted-foreground mt-2">
            Let&apos;s get you set up in just a few steps
          </p>
        </motion.div>

        {/* Progress Steps - Purpose: GUIDE */}
        <div className="flex items-center justify-center mb-8">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <motion.div
                initial={false}
                animate={{
                  scale: currentStep === step.id ? 1.1 : 1,
                }}
                transition={{ duration: MOTION.fast }}
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors duration-300 ${
                  currentStep >= step.id
                    ? 'bg-brand border-brand text-white'
                    : 'border-muted-foreground/30 text-muted-foreground'
                }`}
              >
                {currentStep > step.id ? (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  >
                    <Check className="h-5 w-5" />
                  </motion.div>
                ) : (
                  <step.icon className="h-5 w-5" />
                )}
              </motion.div>
              {index < STEPS.length - 1 && (
                <div className="relative w-16 h-0.5 mx-2 bg-muted-foreground/30 overflow-hidden">
                  <motion.div
                    initial={false}
                    animate={{ scaleX: currentStep > step.id ? 1 : 0 }}
                    transition={{ duration: MOTION.normal, ease: MOTION.easeOutExpo }}
                    className="absolute inset-0 bg-brand origin-left"
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Form Card */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {currentStep === 1 && <User className="h-5 w-5 text-brand" />}
              {currentStep === 2 && <Baby className="h-5 w-5 text-brand" />}
              {currentStep === 3 && <FileCheck className="h-5 w-5 text-brand" />}
              {STEPS[currentStep - 1].title}
            </CardTitle>
            <CardDescription>
              {currentStep === 1 && 'Tell us about yourself'}
              {currentStep === 2 && "Add your child's information"}
              {currentStep === 3 && 'A few more details to complete registration'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AnimatePresence mode="wait" custom={direction}>
              {/* Step 1: Parent Info */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  custom={direction}
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: MOTION.normal, ease: MOTION.easeOutExpo }}
                >
                  <motion.div 
                    className="space-y-6"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <motion.div variants={itemVariants} className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) => updateField('firstName', e.target.value)}
                          placeholder="Your first name"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) => updateField('lastName', e.target.value)}
                          placeholder="Your last name"
                          required
                        />
                      </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handlePhoneChange('phone')}
                          maxLength={LIMITS.phone}
                          placeholder="000-000-0000"
                          className="pl-10"
                          required
                        />
                      </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="border-t pt-6">
                      <h3 className="font-medium mb-4 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-orange-500" />
                        Emergency Contact
                      </h3>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="emergencyContactName">Contact Name *</Label>
                          <Input
                            id="emergencyContactName"
                            value={formData.emergencyContactName}
                            onChange={(e) => updateField('emergencyContactName', e.target.value)}
                            placeholder="Emergency contact name"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="emergencyContactPhone">Contact Phone *</Label>
                          <Input
                            id="emergencyContactPhone"
                            type="tel"
                            value={formData.emergencyContactPhone}
                            onChange={handlePhoneChange('emergencyContactPhone')}
                            maxLength={LIMITS.phone}
                            placeholder="000-000-0000"
                            required
                          />
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                </motion.div>
              )}

              {/* Step 2: Student Info */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  custom={direction}
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: MOTION.normal, ease: MOTION.easeOutExpo }}
                >
                  <motion.div 
                    className="space-y-6"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <motion.div variants={itemVariants} className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="studentFirstName">Student First Name *</Label>
                        <Input
                          id="studentFirstName"
                          value={formData.studentFirstName}
                          onChange={(e) => updateField('studentFirstName', e.target.value)}
                          placeholder="Child's first name"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="studentLastName">Student Last Name *</Label>
                        <Input
                          id="studentLastName"
                          value={formData.studentLastName}
                          onChange={(e) => updateField('studentLastName', e.target.value)}
                          placeholder="Child's last name"
                          required
                        />
                      </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="space-y-2">
                      <Label htmlFor="studentDob">Date of Birth *</Label>
                      <Input
                        id="studentDob"
                        type="date"
                        value={formData.studentDob}
                        onChange={(e) => updateField('studentDob', e.target.value)}
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        This helps us place your child in the appropriate age group
                      </p>
                    </motion.div>

                    <motion.div variants={itemVariants} className="space-y-2">
                      <Label htmlFor="location">Location *</Label>
                      <Select
                        value={formData.locationId}
                        onValueChange={(value) => updateField('locationId', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a location" />
                        </SelectTrigger>
                        <SelectContent>
                          {locations.map((location) => (
                            <SelectItem key={location.id} value={location.id}>
                              <span className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                {location.name}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Which facility will your child attend?
                      </p>
                    </motion.div>

                    <motion.div variants={itemVariants} className="space-y-2">
                      <Label htmlFor="tshirtSize">T-Shirt Size</Label>
                      <Select
                        value={formData.tshirtSize}
                        onValueChange={(value) => updateField('tshirtSize', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select size (for gi/uniform)" />
                        </SelectTrigger>
                        <SelectContent>
                          {T_SHIRT_SIZES.map((size) => (
                            <SelectItem key={size.value} value={size.value}>
                              <span className="flex items-center gap-2">
                                <Shirt className="h-4 w-4 text-muted-foreground" />
                                {size.label}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </motion.div>
                  </motion.div>
                </motion.div>
              )}

              {/* Step 3: Additional Info */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  custom={direction}
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: MOTION.normal, ease: MOTION.easeOutExpo }}
                >
                  <motion.div 
                    className="space-y-6"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <motion.div variants={itemVariants} className="space-y-2">
                      <Label htmlFor="medicalConditions">Medical Conditions / Allergies</Label>
                      <Textarea
                        id="medicalConditions"
                        value={formData.medicalConditions}
                        onChange={(e) => updateField('medicalConditions', e.target.value)}
                        placeholder="List any medical conditions, allergies, or special needs we should be aware of..."
                        rows={3}
                      />
                      <p className="text-xs text-muted-foreground">
                        This helps our coaches ensure your child&apos;s safety
                      </p>
                    </motion.div>

                    <motion.div variants={itemVariants} className="space-y-2">
                      <Label htmlFor="howHeard">How did you hear about us?</Label>
                      <Select
                        value={formData.howHeard}
                        onValueChange={(value) => updateField('howHeard', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select an option" />
                        </SelectTrigger>
                        <SelectContent>
                          {HOW_HEARD_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              <span className="flex items-center gap-2">
                                <Megaphone className="h-4 w-4 text-muted-foreground" />
                                {option.label}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </motion.div>

                    <motion.div variants={itemVariants} className="border-t pt-6 space-y-4">
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id="photoConsent"
                          checked={formData.photoConsent}
                          onCheckedChange={(checked) => updateField('photoConsent', checked as boolean)}
                        />
                        <div className="space-y-1">
                          <label htmlFor="photoConsent" className="text-sm font-medium cursor-pointer">
                            Photo/Video Consent
                          </label>
                          <p className="text-xs text-muted-foreground">
                            I consent to photos and videos of my child being used for promotional purposes
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id="waiverAccepted"
                          checked={formData.waiverAccepted}
                          onCheckedChange={(checked) => updateField('waiverAccepted', checked as boolean)}
                        />
                        <div className="space-y-1">
                          <label htmlFor="waiverAccepted" className="text-sm font-medium cursor-pointer">
                            Liability Waiver *
                          </label>
                          <p className="text-xs text-muted-foreground">
                            I acknowledge that martial arts involves physical contact and accept the inherent risks. 
                            I release Little Grapplers from liability for any injuries that may occur during training.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: MOTION.fast }}
                  className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600 text-sm flex items-center gap-2"
                >
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back
              </Button>

              {currentStep < 3 ? (
                <Button type="button" onClick={nextStep}>
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button 
                  type="button" 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Completing...' : 'Complete Registration'}
                  <Check className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Step indicator */}
        <p className="text-center text-sm text-muted-foreground mt-4">
          Step {currentStep} of {STEPS.length}
        </p>
      </motion.div>
    </div>
  );
}
