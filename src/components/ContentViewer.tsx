'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Modal } from '@/components/ui';
import { ContentAccessManager, ContentAccess, UserAccess } from '@/lib/contentAccess';
import { formatPrice, formatNumber } from '@/lib/utils';
import { 
  Lock, 
  Unlock, 
  Eye, 
  Users, 
  DollarSign, 
  Crown, 
  Star, 
  Shield, 
  Zap,
  FileText,
  Image,
  Video,
  Music,
  File,
  Link,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { CreatorCoin } from '@/types';

interface ContentViewerProps {
  coin: CreatorCoin;
  userId: string;
  onContentAccess?: (contentId: string) => void;
}

export const ContentViewer: React.FC<ContentViewerProps> = ({ 
  coin, 
  userId, 
  onContentAccess 
}) => {
  const [content, setContent] = useState<ContentAccess[]>([]);
  const [userAccess, setUserAccess] = useState<UserAccess | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedContent, setSelectedContent] = useState<ContentAccess | null>(null);
  const [showContentModal, setShowContentModal] = useState(false);

  const contentManager = new ContentAccessManager();

  useEffect(() => {
    loadContent();
    loadUserAccess();
  }, [coin, userId]);

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

  const loadUserAccess = async () => {
    try {
      const holdings = await contentManager.getUserHoldings(userId);
      const accessLevel = contentManager.getAccessLevel(holdings);
      const unlockedContent = await contentManager.getUserUnlockedContent(userId);
      
      setUserAccess({
        userId,
        coinAddress: coin.address,
        holdings,
        accessLevel,
        unlockedContent: unlockedContent.map(c => c.id),
        totalAccessValue: BigInt(0), // Would calculate based on content value
        lastAccessCheck: new Date()
      });
    } catch (err) {
      console.error('Error loading user access:', err);
    }
  };

  const handleContentClick = async (content: ContentAccess) => {
    try {
      // Check access
      const accessCheck = await contentManager.checkContentAccess(userId, coin.address, content.id);
      
      if (accessCheck.hasAccess) {
        // Record access
        await contentManager.recordContentAccess(userId, content.id, coin.address);
        
        // Show content
        setSelectedContent(content);
        setShowContentModal(true);
        
        // Notify parent
        onContentAccess?.(content.id);
      } else {
        alert(`You need at least ${formatNumber(Number(accessCheck.requiredHoldings) / 1e18)} ${coin.symbol} coins to access this content.`);
      }
    } catch (error) {
      console.error('Error accessing content:', error);
      alert('Error accessing content. Please try again.');
    }
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'text':
        return <FileText className="h-5 w-5" />;
      case 'image':
        return <Image className="h-5 w-5" />;
      case 'video':
        return <Video className="h-5 w-5" />;
      case 'audio':
        return <Music className="h-5 w-5" />;
      case 'file':
        return <File className="h-5 w-5" />;
      case 'link':
        return <Link className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
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

  const canAccessContent = (content: ContentAccess): boolean => {
    if (!userAccess) return false;
    return userAccess.holdings >= content.requiredHoldings;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <span className="ml-2">Loading exclusive content...</span>
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
      {/* User Access Status */}
      {userAccess && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Crown className="h-5 w-5 mr-2" />
              Your Access Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className={`w-12 h-12 mx-auto mb-2 rounded-full ${getAccessTierColor(userAccess.accessLevel)} flex items-center justify-center`}>
                  {getAccessTierIcon(userAccess.accessLevel)}
                </div>
                <h3 className="font-semibold capitalize">{userAccess.accessLevel} Tier</h3>
                <p className="text-sm text-gray-600">
                  {formatNumber(Number(userAccess.holdings) / 1e18)} {coin.symbol} coins
                </p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Unlock className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <h3 className="font-semibold">{userAccess.unlockedContent.length}</h3>
                <p className="text-sm text-gray-600">Unlocked Content</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <h3 className="font-semibold">{content.length}</h3>
                <p className="text-sm text-gray-600">Total Content</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Exclusive Content</h2>
          <Badge variant="outline">
            {content.filter(c => canAccessContent(c)).length} / {content.length} unlocked
          </Badge>
        </div>

        {content.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">No exclusive content available yet</p>
            </CardContent>
          </Card>
        ) : (
          content.map((item) => {
            const hasAccess = canAccessContent(item);
            
            return (
              <Card 
                key={item.id} 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  hasAccess ? 'hover:bg-gray-50' : 'opacity-60'
                }`}
                onClick={() => hasAccess && handleContentClick(item)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-lg ${
                        hasAccess ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {hasAccess ? <Unlock className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold">{item.title}</h3>
                          <Badge className={getAccessTierColor(item.accessLevel)}>
                            {getAccessTierIcon(item.accessLevel)}
                            <span className="ml-1">{item.accessLevel.toUpperCase()}</span>
                          </Badge>
                          {hasAccess && (
                            <Badge variant="success">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Unlocked
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-600 mb-3">{item.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            {getContentIcon(item.contentType)}
                            <span className="capitalize">{item.contentType}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Eye className="h-4 w-4" />
                            <span>{item.viewCount} views</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span>{item.uniqueViewers} unique</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{item.createdAt.toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {hasAccess ? (
                        <Button variant="default">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      ) : (
                        <div className="text-center">
                          <div className="flex items-center space-x-1 text-sm text-gray-500 mb-1">
                            <Lock className="h-4 w-4" />
                            <span>Requires</span>
                          </div>
                          <div className="text-sm font-semibold">
                            {formatNumber(Number(item.requiredHoldings) / 1e18)} {coin.symbol}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Content Modal */}
      {selectedContent && (
        <Modal
          isOpen={showContentModal}
          onClose={() => setShowContentModal(false)}
          title={selectedContent.title}
          size="lg"
        >
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              {getContentIcon(selectedContent.contentType)}
              <span className="text-sm text-gray-600 capitalize">
                {selectedContent.contentType} • {selectedContent.viewCount} views
              </span>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700">{selectedContent.description}</p>
            </div>

            <div className="text-center">
              <Button 
                onClick={() => window.open(selectedContent.contentUrl, '_blank')}
                className="w-full"
              >
                <Link className="h-4 w-4 mr-2" />
                Open Content
              </Button>
            </div>

            <div className="text-xs text-gray-500 text-center">
              This content is exclusive to {selectedContent.accessLevel} tier holders
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
