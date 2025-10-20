'use client';

import React, { useState } from 'react';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, Input, Badge, Modal } from '@/components/ui';
import { Search, Plus, TrendingUp, Users, DollarSign, Clock, Star, ArrowUp, ArrowDown } from 'lucide-react';

const DesignSystemShowcase: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-12">
      {/* Typography Section */}
      <section>
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Typography</h2>
        <div className="space-y-4">
          <h1 className="text-6xl font-bold text-gray-900">Heading 1</h1>
          <h2 className="text-5xl font-bold text-gray-900">Heading 2</h2>
          <h3 className="text-4xl font-bold text-gray-900">Heading 3</h3>
          <h4 className="text-3xl font-bold text-gray-900">Heading 4</h4>
          <h5 className="text-2xl font-bold text-gray-900">Heading 5</h5>
          <h6 className="text-xl font-bold text-gray-900">Heading 6</h6>
          <p className="text-lg text-gray-700">Large paragraph text</p>
          <p className="text-base text-gray-700">Regular paragraph text</p>
          <p className="text-sm text-gray-600">Small paragraph text</p>
          <p className="text-xs text-gray-500">Extra small paragraph text</p>
        </div>
      </section>

      {/* Colors Section */}
      <section>
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Colors</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="space-y-2">
            <div className="h-16 bg-black rounded-lg"></div>
            <p className="text-sm font-medium">Black</p>
            <p className="text-xs text-gray-500">#000000</p>
          </div>
          <div className="space-y-2">
            <div className="h-16 bg-white border border-gray-300 rounded-lg"></div>
            <p className="text-sm font-medium">White</p>
            <p className="text-xs text-gray-500">#ffffff</p>
          </div>
          <div className="space-y-2">
            <div className="h-16 bg-gray-100 rounded-lg"></div>
            <p className="text-sm font-medium">Gray 100</p>
            <p className="text-xs text-gray-500">#f5f5f5</p>
          </div>
          <div className="space-y-2">
            <div className="h-16 bg-gray-500 rounded-lg"></div>
            <p className="text-sm font-medium">Gray 500</p>
            <p className="text-xs text-gray-500">#737373</p>
          </div>
          <div className="space-y-2">
            <div className="h-16 bg-blue-500 rounded-lg"></div>
            <p className="text-sm font-medium">Blue</p>
            <p className="text-xs text-gray-500">#3b82f6</p>
          </div>
          <div className="space-y-2">
            <div className="h-16 bg-green-500 rounded-lg"></div>
            <p className="text-sm font-medium">Green</p>
            <p className="text-xs text-gray-500">#10b981</p>
          </div>
        </div>
      </section>

      {/* Buttons Section */}
      <section>
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Buttons</h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Variants</h3>
            <div className="flex flex-wrap gap-3">
              <Button>Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="success">Success</Button>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-3">Sizes</h3>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
              <Button size="xl">Extra Large</Button>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">With Icons</h3>
            <div className="flex flex-wrap gap-3">
              <Button leftIcon={<Plus className="h-4 w-4" />}>Add Coin</Button>
              <Button rightIcon={<TrendingUp className="h-4 w-4" />}>View Stats</Button>
              <Button loading>Loading...</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Cards Section */}
      <section>
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Creator Coin</CardTitle>
              <CardDescription>@creatorname</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Price</span>
                  <span className="font-semibold">$0.0234</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">24h Change</span>
                  <span className="text-green-600 flex items-center">
                    <ArrowUp className="h-3 w-3 mr-1" />
                    +12.5%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Volume</span>
                  <span className="font-semibold">$45.2K</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Portfolio</CardTitle>
              <CardDescription>Your holdings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                    <span className="font-medium">Creator A</span>
                  </div>
                  <span className="text-sm text-gray-600">1,234 coins</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                    <span className="font-medium">Creator B</span>
                  </div>
                  <span className="text-sm text-gray-600">567 coins</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Bought 100 coins</span>
                  <span className="text-xs text-gray-500 ml-auto">2m ago</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-sm">Sold 50 coins</span>
                  <span className="text-xs text-gray-500 ml-auto">1h ago</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Form Elements Section */}
      <section>
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Form Elements</h2>
        <div className="max-w-md space-y-6">
          <Input
            label="Search creators"
            placeholder="Enter creator name..."
            leftIcon={<Search className="h-4 w-4" />}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          
          <Input
            label="Amount"
            placeholder="0.00"
            rightIcon={<DollarSign className="h-4 w-4" />}
            helperText="Enter the amount you want to trade"
          />
          
          <Input
            label="Invalid Input"
            placeholder="This will show an error"
            error="This field is required"
          />
          
          <Input
            label="Success Input"
            placeholder="This shows success state"
            variant="success"
            helperText="Great! This looks good"
          />
        </div>
      </section>

      {/* Badges Section */}
      <section>
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Badges</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-3">Variants</h3>
            <div className="flex flex-wrap gap-2">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="error">Error</Badge>
              <Badge variant="info">Info</Badge>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-3">Sizes</h3>
            <div className="flex flex-wrap items-center gap-2">
              <Badge size="sm">Small</Badge>
              <Badge size="md">Medium</Badge>
              <Badge size="lg">Large</Badge>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">With Icons</h3>
            <div className="flex flex-wrap gap-2">
              <Badge leftIcon={<TrendingUp className="h-3 w-3" />}>Trending</Badge>
              <Badge rightIcon={<Star className="h-3 w-3" />}>Featured</Badge>
              <Badge leftIcon={<Users className="h-3 w-3" />} variant="success">Active</Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Modal Section */}
      <section>
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Modal</h2>
        <div className="space-y-4">
          <Button onClick={() => setIsModalOpen(true)}>
            Open Modal
          </Button>
          
          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="Trade Creator Coin"
            description="Buy or sell creator coins"
            size="md"
          >
            <div className="space-y-4">
              <Input
                label="Amount"
                placeholder="Enter amount"
                type="number"
              />
              <div className="flex gap-3">
                <Button className="flex-1">Buy</Button>
                <Button variant="outline" className="flex-1">Sell</Button>
              </div>
            </div>
          </Modal>
        </div>
      </section>

      {/* Stats Section */}
      <section>
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Stats & Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Volume</p>
                  <p className="text-2xl font-bold text-gray-900">$2.4M</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <DollarSign className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-green-600">
                <ArrowUp className="h-4 w-4 mr-1" />
                +12.5% from last month
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Creators</p>
                  <p className="text-2xl font-bold text-gray-900">1,234</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-green-600">
                <ArrowUp className="h-4 w-4 mr-1" />
                +8.2% from last month
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Trades Today</p>
                  <p className="text-2xl font-bold text-gray-900">5,678</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-red-600">
                <ArrowDown className="h-4 w-4 mr-1" />
                -2.1% from yesterday
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg. Price</p>
                  <p className="text-2xl font-bold text-gray-900">$0.0234</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-green-600">
                <ArrowUp className="h-4 w-4 mr-1" />
                +5.7% from last week
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default DesignSystemShowcase;
