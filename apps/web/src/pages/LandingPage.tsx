import { Link } from 'react-router-dom';
import { Clock, Heart, Shield, Users, Calendar, Mail } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-2xl font-bold text-gray-900">TimeCap</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="btn-primary"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-8">
              Your Digital
              <span className="gradient-primary bg-clip-text text-transparent"> Time Capsule</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Create and schedule audio and video messages for future delivery to loved ones. 
              Preserve precious moments and surprise your future self or others with heartfelt messages.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="btn-primary btn-lg"
              >
                Start Creating Capsules
              </Link>
              <button className="btn-outline btn-lg">
                Watch Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose TimeCap?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Built with privacy, security, and meaningful connections in mind
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card p-8 text-center hover:shadow-lg transition-shadow">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 rounded-lg mb-4">
                  <feature.icon className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600">
              Simple steps to create lasting memories
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 text-white rounded-full text-2xl font-bold mb-4">
                  {index + 1}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-primary">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Create Your First Time Capsule?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of users preserving memories for the future
          </p>
          <Link
            to="/register"
            className="btn bg-white text-primary-600 hover:bg-gray-100 btn-lg"
          >
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Clock className="h-6 w-6 text-primary-400" />
                <span className="ml-2 text-xl font-bold">TimeCap</span>
              </div>
              <p className="text-gray-400">
                Preserving memories for tomorrow, one message at a time.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 TimeCap. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const features = [
  {
    icon: Heart,
    title: 'Meaningful Connections',
    description: 'Send heartfelt messages to loved ones or your future self, creating lasting emotional bonds across time.',
  },
  {
    icon: Shield,
    title: 'Privacy & Security',
    description: 'Your messages are encrypted and secure. Only intended recipients can access them when the time comes.',
  },
  {
    icon: Calendar,
    title: 'Flexible Scheduling',
    description: 'Schedule delivery from hours to decades in the future. Perfect for birthdays, anniversaries, or milestones.',
  },
  {
    icon: Users,
    title: 'Multiple Recipients',
    description: 'Send to individuals or groups via email, SMS, or in-app notifications.',
  },
  {
    icon: Mail,
    title: 'Rich Media Support',
    description: 'Include audio, video, photos, and text in your time capsules for a complete experience.',
  },
  {
    icon: Clock,
    title: 'Legacy Features',
    description: 'Designate trusted contacts to receive your capsules if you become inactive.',
  },
];

const steps = [
  {
    title: 'Record Your Message',
    description: 'Create audio, video, or text messages with photos and attachments.',
  },
  {
    title: 'Set Delivery Date',
    description: 'Choose when your message should be delivered - from tomorrow to decades ahead.',
  },
  {
    title: 'Add Recipients',
    description: 'Select who should receive your time capsule when the moment arrives.',
  },
];

export default LandingPage;