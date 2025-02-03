const compress = async (data: string) => {
  // テキストデータをバイナリデータに変換
  const encoder = new TextEncoder();
  const buf = encoder.encode(data);

  const readableStream = new Blob([buf]).stream();

  // 圧縮データのストリームを作成
  const compressedStream = readableStream.pipeThrough(
    new CompressionStream("deflate")
  );

  // 圧縮されたデータを取得
  const compressedArrayBuffer = await new Response(
    compressedStream
  ).arrayBuffer();
  // console.log(
  //   'native buffer',
  //   buf.byteLength,
  //   'compressedArrayBuffer',
  //   compressedArrayBuffer.byteLength,
  //   'compressed',
  //   Math.round((compressedArrayBuffer.byteLength / buf.byteLength) * 100) + '%'
  // )
  self.postMessage(compressedArrayBuffer);
};
const decompress = async (data: ArrayBuffer) => {
  console.log("decompress", data);
  // 解凍データのストリームを作成
  const decompressedStream = new Blob([data])
    .stream()
    .pipeThrough(new DecompressionStream("deflate"));

  // 解凍されたデータを取得
  const decompressedResponse = await new Response(decompressedStream).text();

  // テキストデータに変換し返却
  self.postMessage(decompressedResponse);
};

// Web Workerでのメッセージイベントリスナー
self.onmessage = (
  message: MessageEvent<{
    type: "compress" | "decompress";
    buffer: string | ArrayBuffer;
  }>
) => {
  const { data } = message;
  switch (data.type) {
    case "compress":
      compress(data.buffer as string);
      break;
    case "decompress":
      decompress(data.buffer as ArrayBuffer);
      break;
  }
};
