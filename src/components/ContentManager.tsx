'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Badge, Modal, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';
import { ContentAccessManager, ContentAccess, AccessTier, UserAccess } from '@/lib/contentAccess';
import { formatPrice, formatNumber } from '@/lib/utils';
import { 
  Plus, 
  Eye, 
  Lock, 
  Unlock, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Settings,
  FileText,
  Image,
  Video,
  Music,
  File,
  Link,
  Crown,
  Star,
  Shield,
  Zap
} from 'lucide-react';
import { CreatorCoin } from '@/types';

interface ContentManagerProps {
  coin: CreatorCoin;
  creatorId: string;
  onContentCreated?: (content: ContentAccess) => void;
}

export const ContentManager: React.FC<ContentManagerProps> = ({ 
  coin, 
  creatorId, 
  onContentCreated 
}) => {
  const [content, setContent] = useState<ContentAccess[]>([]);
  const [accessTiers, setAccessTiers] = useState<AccessTier[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'analytics' | 'settings'>('content');

  const contentManager = new ContentAccessManager();

  useEffect(() => {
    loadContent();
    loadAccessTiers();
  }, [coin]);

  const loadContent = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const contentList = await contentManager.getContentByCoin(coin.address);
      setContent(contentList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const loadAccessTiers = async () => {
    try {
      const tiers = contentManager.getAccessTiers();
      setAccessTiers(tiers);
    } catch (err) {
      console.error('Error loading access tiers:', err);
    }
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'text':
        return <FileText className="h-4 w-4" />;
      case 'image':
        return <Image className="h-4 w-4" />;
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'audio':
        return <Music className="h-4 w-4" />;
      case 'file':
        return <File className="h-4 w-4" />;
      case 'link':
        return <Link className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getAccessTierColor = (level: string) => {
    switch (level) {
      case 'bronze':
        return 'bg-yellow-600';
      case 'silver':
        return 'bg-gray-400';
      case 'gold':
        return 'bg-yellow-500';
      case 'platinum':
        return 'bg-gray-300';
      case 'diamond':
        return 'bg-blue-400';
      default:
        return 'bg-gray-500';
    }
  };

  const getAccessTierIcon = (level: string) => {
    switch (level) {
      case 'bronze':
        return <Shield className="h-4 w-4" />;
      case 'silver':
        return <Star className="h-4 w-4" />;
      case 'gold':
        return <Crown className="h-4 w-4" />;
      case 'platinum':
        return <Zap className="h-4 w-4" />;
      case 'diamond':
        return <Crown className="h-4 w-4" />;
      default:
        return <Lock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <span className="ml-2">Loading content...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={loadContent}>Retry</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Content Manager</h2>
          <p className="text-gray-600">Manage exclusive content for {coin.name} holders</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Content
        </Button>
      </div>

      {/* Access Tiers Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Crown className="h-5 w-5 mr-2" />
            Access Tiers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {accessTiers.map((tier) => (
              <div key={tier.name} className="text-center p-4 border rounded-lg">
                <div className={`w-12 h-12 mx-auto mb-2 rounded-full ${getAccessTierColor(tier.name.toLowerCase())} flex items-center justify-center`}>
                  {getAccessTierIcon(tier.name.toLowerCase())}
                </div>
                <h3 className="font-semibold">{tier.name}</h3>
                <p className="text-sm text-gray-600">
                  {formatNumber(Number(tier.requiredHoldings) / 1e18)} coins
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {tier.discount}% discount
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-4">
          {/* Content List */}
          <div className="space-y-4">
            {content.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500 mb-4">No content created yet</p>
                  <Button onClick={() => setShowCreateModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Content
                  </Button>
                </CardContent>
              </Card>
            ) : (
              content.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          {getContentIcon(item.contentType)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-semibold">{item.title}</h3>
                            <Badge variant={item.isActive ? 'success' : 'secondary'}>
                              {item.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                            <Badge className={getAccessTierColor(item.accessLevel)}>
                              {item.accessLevel.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-gray-600 mb-3">{item.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Eye className="h-4 w-4" />
                              <span>{item.viewCount} views</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Users className="h-4 w-4" />
                              <span>{item.uniqueViewers} unique</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <DollarSign className="h-4 w-4" />
                              <span>{formatPrice(item.revenue)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Lock className="h-4 w-4" />
                              <span>{formatNumber(Number(item.requiredHoldings) / 1e18)} coins</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          {/* Analytics Content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Eye className="h-6 w-6 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Total Views</p>
                    <p className="text-2xl font-bold">
                      {content.reduce((sum, item) => sum + item.viewCount, 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Users className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Unique Viewers</p>
                    <p className="text-2xl font-bold">
                      {content.reduce((sum, item) => sum + item.uniqueViewers, 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold">
                      {formatPrice(content.reduce((sum, item) => sum + item.revenue, BigInt(0)))}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Content Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Content Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {content.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getContentIcon(item.contentType)}
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-gray-600">{item.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Views</p>
                        <p className="font-semibold">{item.viewCount}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Revenue</p>
                        <p className="font-semibold">{formatPrice(item.revenue)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Access Level</p>
                        <Badge className={getAccessTierColor(item.accessLevel)}>
                          {item.accessLevel.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          {/* Settings Content */}
          <Card>
            <CardHeader>
              <CardTitle>Content Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Access Level
                  </label>
                  <select className="w-full p-2 border border-gray-300 rounded-md">
                    <option value="bronze">Bronze</option>
                    <option value="silver">Silver</option>
                    <option value="gold">Gold</option>
                    <option value="platinum">Platinum</option>
                    <option value="diamond">Diamond</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content Moderation
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" defaultChecked />
                      <span className="text-sm">Auto-approve content</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span className="text-sm">Require manual approval</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Revenue Sharing
                  </label>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="number" 
                      className="w-20 p-2 border border-gray-300 rounded-md" 
                      defaultValue="10"
                      min="0"
                      max="100"
                    />
                    <span className="text-sm text-gray-600">% to platform</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Content Modal */}
      <CreateContentModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        coin={coin}
        creatorId={creatorId}
        onContentCreated={(content) => {
          setContent(prev => [content, ...prev]);
          onContentCreated?.(content);
          setShowCreateModal(false);
        }}
      />
    </div>
  );
};

// Create Content Modal Component
interface CreateContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  coin: CreatorCoin;
  creatorId: string;
  onContentCreated: (content: ContentAccess) => void;
}

const CreateContentModal: React.FC<CreateContentModalProps> = ({
  isOpen,
  onClose,
  coin,
  creatorId,
  onContentCreated
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    contentUrl: '',
    contentType: 'text' as const,
    requiredHoldings: '1000',
    accessLevel: 'bronze' as const
  });
  const [loading, setLoading] = useState(false);

  const contentManager = new ContentAccessManager();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const content = await contentManager.createContent(creatorId, coin.address, {
        ...formData,
        requiredHoldings: BigInt(parseInt(formData.requiredHoldings) * 1e18)
      });

      onContentCreated(content);
    } catch (error) {
      console.error('Error creating content:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Exclusive Content"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Title"
          placeholder="Enter content title"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            className="w-full p-2 border border-gray-300 rounded-md"
            rows={3}
            placeholder="Describe your exclusive content"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            required
          />
        </div>

        <Input
          label="Content URL"
          placeholder="https://example.com/content"
          value={formData.contentUrl}
          onChange={(e) => setFormData(prev => ({ ...prev, contentUrl: e.target.value }))}
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content Type
          </label>
          <select
            className="w-full p-2 border border-gray-300 rounded-md"
            value={formData.contentType}
            onChange={(e) => setFormData(prev => ({ ...prev, contentType: e.target.value as any }))}
          >
            <option value="text">Text</option>
            <option value="image">Image</option>
            <option value="video">Video</option>
            <option value="audio">Audio</option>
            <option value="file">File</option>
            <option value="link">Link</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Required Holdings"
            type="number"
            placeholder="1000"
            value={formData.requiredHoldings}
            onChange={(e) => setFormData(prev => ({ ...prev, requiredHoldings: e.target.value }))}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Access Level
            </label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md"
              value={formData.accessLevel}
              onChange={(e) => setFormData(prev => ({ ...prev, accessLevel: e.target.value as any }))}
            >
              <option value="bronze">Bronze</option>
              <option value="silver">Silver</option>
              <option value="gold">Gold</option>
              <option value="platinum">Platinum</option>
              <option value="diamond">Diamond</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Create Content
          </Button>
        </div>
      </form>
    </Modal>
  );
};
