import { Component, type ComponentProps, type PropsWithChildren } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Rocket } from 'lucide-react'
import { ProductHuntSankeyChart } from '@/components/charts/ProductHuntSankeyChart'

type SankeyData = ComponentProps<typeof ProductHuntSankeyChart>['data'];

interface ProductHuntInsightsProps {
  data: {
    product_hunt_tag_connections: SankeyData | null;
  } | null;
}

function ProductHuntFallback({ message }: { message: string }) {
  return (
    <Card className="h-full bg-white/70 backdrop-blur-sm border-0 shadow-xl flex items-center justify-center">
      <p className="text-muted-foreground">{message}</p>
    </Card>
  );
}

class ProductHuntErrorBoundary extends Component<PropsWithChildren, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <ProductHuntFallback message="Product Hunt chart is unavailable." />;
    }

    return this.props.children;
  }
}

function ProductHuntInsightsContent({ data }: ProductHuntInsightsProps) {
  const sankeyData = data?.product_hunt_tag_connections;
  if (!sankeyData || !Array.isArray(sankeyData.nodes) || !Array.isArray(sankeyData.links)) {
    return <ProductHuntFallback message="No Product Hunt data available." />;
  }

  const nodesById = new Map<string, SankeyData['nodes'][number]>();
  for (const node of sankeyData.nodes) {
    if (typeof node?.id === 'string' && node.id.length > 0) {
      nodesById.set(node.id, node);
    }
  }

  const links = sankeyData.links.filter(link =>
    link &&
    nodesById.has(link.source) &&
    nodesById.has(link.target) &&
    link.source !== link.target &&
    Number.isFinite(link.value) &&
    link.value > 0
  );
  if (links.length === 0) {
    return <ProductHuntFallback message="No Product Hunt connections to display." />;
  }

  const linkedIds = new Set(links.flatMap(({ source, target }) => [source, target]));
  const nodes = [...nodesById.values()].filter(node => linkedIds.has(node.id));

  return (
    <Card className="h-full bg-white/70 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
      <CardHeader className="pb-1">
        <CardTitle className="flex items-center gap-2 text-lg font-bold text-gray-800">
          <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
            <Rocket className="h-5 w-5 text-white" />
          </div>
          Product Hunt Category Flow
        </CardTitle>
        <p className="text-sm text-gray-600">Which products are catching customers’ attention?</p>
      </CardHeader>
      <CardContent className="pt-1 h-[calc(100%-80px)]">
        <ProductHuntSankeyChart data={{ nodes, links }} />
      </CardContent>
    </Card>
  );
}

export function ProductHuntInsights(props: ProductHuntInsightsProps) {
  return (
    <ProductHuntErrorBoundary>
      <ProductHuntInsightsContent {...props} />
    </ProductHuntErrorBoundary>
  );
}
