# 地理院ベクトル地図 Maki アイコン置き換えビューア

国土地理院の最適化ベクトルタイル（標準地図風スタイル）で、注記の地図記号を [Maki](https://github.com/mapbox/maki) アイコンに置き換えて表示する MapLibre GL JS のビューアです。

## 特徴

- 国土地理院の最適化ベクトルタイル（`optimal_bvmap-v1`）を PMTiles 形式で直接読み込み
- 注記（`Anno`）の `vt_code` 91 種類を、45 種類の Maki アイコンに対応付けて表示
- 地理院の地図記号アイコンは非表示にし、駅名・建物名などのラベルはそのまま表示
- ラベルの配置を Maki アイコンより優先
- 地物をクリックすると、レイヤ名とプロパティをポップアップで表示
- URL ハッシュに地図の表示位置を保存（`hash: true`）

## ファイル構成

```
viewer/
├── index.html           # 地図コンテナとポップアップ用のスタイル
├── main.js              # MapLibre の初期化とクリック時の情報表示
├── gsi_maki_style.json  # 地理院スタイルに Maki アイコンレイヤを追加したスタイル
└── sprite/              # Maki アイコンのスプライト
    ├── maki.json
    ├── maki.png
    ├── maki@2x.json
    └── maki@2x.png
```

## 出典・ライセンス

- 地図データ：[国土地理院 最適化ベクトルタイル](https://github.com/gsi-cyberjapan/optimal_bvmap)
- アイコン：[Maki](https://github.com/mapbox/maki)（CC0 1.0）
