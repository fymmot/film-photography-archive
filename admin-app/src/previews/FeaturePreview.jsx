import React from "react";
import { AssetImage } from "../AssetImage";

function FeaturePreview({ entry, getAsset, widgetFor }) {
  const title = entry.getIn(["data", "title"]);
  const heroPath = entry.getIn(["data", "heroImage"]);
  const images = entry.getIn(["data", "images"])?.toJS() ?? [];

  return (
    <article className="cms-preview-feature">
      <h1>{title}</h1>
      {heroPath && (
        <figure className="cms-preview-hero">
          <AssetImage getAsset={getAsset} path={heroPath} alt={title} className="cms-preview-img" />
        </figure>
      )}
      {images.length > 0 && (
        <ul className="cms-preview-images-list">
          {images.map((item, i) => (
            <li key={i}>
              <figure className="cms-preview-figure">
                <AssetImage
                  getAsset={getAsset}
                  path={item?.image}
                  alt={item?.alt ?? ""}
                  className="cms-preview-img"
                />
                {item?.alt && <figcaption>{item.alt}</figcaption>}
              </figure>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

export default FeaturePreview;
