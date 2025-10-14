import { Metadata } from "next";
import AudioProcessorClient from "./AudioProcessorClient";

export const metadata: Metadata = {
  title: "音频处理工具 | 在线音频编辑与可视化",
  description: "上传音频文件，查看波形可视化，调整音色、音调和音量，实时预览效果并播放修改后的音频。",
};

export default function AudioProcessorPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">音频处理工具</h1>
      <p className="mb-6 text-gray-600">
        上传音频文件，查看波形可视化，调整音色、音调和音量，实时预览效果并播放修改后的音频。
      </p>
      <AudioProcessorClient />
    </div>
  );
}