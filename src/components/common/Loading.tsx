export function Loading({ text = '불러오는 중...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div className="w-8 h-8 border-3 border-gray-200 border-t-[#3454D0] rounded-full animate-spin" style={{ borderWidth: 3 }} />
      <p className="text-sm text-gray-500">{text}</p>
    </div>
  );
}

export function PageLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-10 h-10 border-4 border-gray-200 border-t-[#3454D0] rounded-full animate-spin" />
    </div>
  );
}
