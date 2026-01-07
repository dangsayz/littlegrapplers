import { CreditCard, Receipt, AlertCircle, FileCode, CheckCircle2, Clock, Circle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const seoWorkOrder: {
  title: string;
  description: string;
  dateCreated: string;
  status: 'pending' | 'in_progress' | 'completed';
  items: { task: string; status: string; priority: string }[];
} = {
  title: 'SEO Implementation',
  description: 'World-class SEO techniques for organic ranking',
  dateCreated: '2026-01-06',
  status: 'completed',
  items: [
    { task: 'Create sitemap.ts - Auto-generated sitemap with all routes', status: 'completed', priority: 'critical' },
    { task: 'Create robots.ts - Proper crawl directives', status: 'completed', priority: 'critical' },
    { task: 'Add JSON-LD structured data (Organization, LocalBusiness, FAQPage)', status: 'completed', priority: 'high' },
    { task: 'Fix SITE_CONFIG URL - Update to littlegrapplers.net', status: 'completed', priority: 'high' },
    { task: 'Add page-specific metadata to key pages (About, FAQ)', status: 'completed', priority: 'medium' },
    { task: 'Enhanced root layout with keywords, authors, canonical URLs', status: 'completed', priority: 'high' },
    { task: 'Added Google verification support', status: 'completed', priority: 'medium' },
  ],
};

const mockAddress = {
  address: '123 Main Street',
  city: 'Austin',
  state: 'TX',
  zip: '78701',
};

export default async function BillingPage() {
  const address = mockAddress;

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
          <CreditCard className="h-6 w-6 text-brand" />
          Billing & Payment
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your payment method and view invoices
        </p>
      </div>

      {/* Coming Soon Notice */}
      <Card className="border-brand/30 bg-brand/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-brand mt-0.5" />
            <div>
              <p className="font-medium text-brand">
                Coming Soon
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Online payment processing will be available soon. For now, please contact us directly for billing inquiries.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-brand" />
            Payment Method
          </CardTitle>
          <Badge variant="secondary">Coming Soon</Badge>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <CreditCard className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground mb-4">
              No payment method on file
            </p>
            <Button disabled>
              Add Payment Method
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Available soon
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Billing Address */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Billing Address</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <a href="/dashboard/settings">Edit</a>
          </Button>
        </CardHeader>
        <CardContent>
          {address.address ? (
            <div className="text-muted-foreground">
              <p>{address.address}</p>
              <p>
                {address.city}, {address.state} {address.zip}
              </p>
            </div>
          ) : (
            <p className="text-muted-foreground">
              No billing address on file.{' '}
              <a href="/dashboard/settings" className="text-brand hover:underline">
                Add one in settings
              </a>
            </p>
          )}
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Receipt className="h-5 w-5 text-brand" />
            Payment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Receipt className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">
              No payment history yet
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Development Work Order */}
      <Card className="border-violet-200 bg-gradient-to-br from-violet-50/50 to-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileCode className="h-5 w-5 text-violet-600" />
              Development Work Order
            </CardTitle>
            <Badge 
              variant="outline" 
              className={
                seoWorkOrder.status === 'completed' 
                  ? 'border-green-500 text-green-600 bg-green-50' 
                  : 'border-amber-500 text-amber-600 bg-amber-50'
              }
            >
              {seoWorkOrder.status === 'completed' ? 'Completed' : 'In Progress'}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {seoWorkOrder.description}
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm text-muted-foreground border-b pb-2">
              <span>Order: {seoWorkOrder.title}</span>
              <span>Created: {new Date(seoWorkOrder.dateCreated).toLocaleDateString()}</span>
            </div>
            
            <div className="space-y-2">
              {seoWorkOrder.items.map((item, index) => (
                <div 
                  key={index} 
                  className="flex items-start gap-3 p-3 rounded-lg bg-white border border-slate-100"
                >
                  {item.status === 'completed' ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  ) : item.status === 'in_progress' ? (
                    <Clock className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                  ) : (
                    <Circle className="h-5 w-5 text-slate-300 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${item.status === 'completed' ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                      {item.task}
                    </p>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`text-xs flex-shrink-0 ${
                      item.priority === 'critical' 
                        ? 'border-red-300 text-red-600 bg-red-50' 
                        : item.priority === 'high'
                        ? 'border-orange-300 text-orange-600 bg-orange-50'
                        : item.priority === 'medium'
                        ? 'border-blue-300 text-blue-600 bg-blue-50'
                        : 'border-slate-300 text-slate-600 bg-slate-50'
                    }`}
                  >
                    {item.priority}
                  </Badge>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t mt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Progress: {seoWorkOrder.items.filter(i => i.status === 'completed').length} / {seoWorkOrder.items.length} tasks
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-violet-500 to-violet-600 rounded-full transition-all"
                      style={{ 
                        width: `${(seoWorkOrder.items.filter(i => i.status === 'completed').length / seoWorkOrder.items.length) * 100}%` 
                      }}
                    />
                  </div>
                  <span className="text-xs font-medium text-violet-600">
                    {Math.round((seoWorkOrder.items.filter(i => i.status === 'completed').length / seoWorkOrder.items.length) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
