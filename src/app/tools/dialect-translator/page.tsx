import { Metadata } from "next";
import DialectTranslatorClient from "./DialectTranslatorClient";

export const metadata: Metadata = {
  title: "方言翻译工具 | 普通话与上海话互译",
  description: "录制语音，实时将普通话翻译为上海话或将上海话翻译为普通话，并播放翻译后的语音。",
};

export default function DialectTranslatorPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">方言翻译工具</h1>
      <p className="mb-6 text-gray-600">
        录制语音，实时将普通话翻译为上海话或将上海话翻译为普通话，并播放翻译后的语音。
      </p>
      <DialectTranslatorClient />
    </div>
  );
}