import { GemCrushGame } from '@/components/GemCrushGame';
import { MagicBackground } from '@/components/MagicBackground';
import { generateToolMetadata } from '@/lib/tool-seo';

export const metadata = generateToolMetadata('gem-crush');

export default function GemCrushPage() {
  return (
    <div className="min-h-screen relative">
      <MagicBackground />
      <div className="relative z-10 container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center text-white mb-8 drop-shadow-lg">
          ✨ 梦幻宝石消消乐 ✨
        </h1>
        <GemCrushGame />
      </div>
    </div>
  );
}