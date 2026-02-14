import React from "react";
import { AssetImage } from "../AssetImage";

const MONTHS = [
  "", "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function formatDate(value) {
  if (!value) return "";
  const d = typeof value === "string" ? new Date(value) : value;
  return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleDateString("en-CA", { year: "numeric", month: "short", day: "numeric" });
}

function RollPreview({ entry, getAsset, widgetFor }) {
  const data = entry.getIn(["data"])?.toJS() ?? {};
  const {
    title,
    roll_id,
    roll_year,
    roll_month,
    camera,
    film,
    film_speed,
    developer,
    lenses,
    location,
    tags,
    start_date,
    end_date,
    comments,
    images = [],
  } = data;

  const monthName = MONTHS[Number(roll_month)] ?? roll_month;
  const dateShot = monthName && roll_year ? `${monthName} ${roll_year}` : "";
  const lensesList = Array.isArray(lenses) ? lenses : lenses ? [lenses] : [];
  const locationsList = Array.isArray(location) ? location : location ? [location] : [];
  const tagsList = Array.isArray(tags) ? tags : tags ? [tags] : [];

  const subheadingParts = [];
  if (roll_id != null) subheadingParts.push(`Roll #${roll_id}`);
  if (dateShot) subheadingParts.push(dateShot);
  const subheadingText = subheadingParts.join(" ");

  return (
    <article className="cms-preview-roll">
      <header>
        <h1>{title}</h1>
        {subheadingText && (
          <p className="cms-preview-subheading">{subheadingText}</p>
        )}
      </header>

      <section className="cms-preview-details">
        <dl>
          {roll_id != null && (
            <>
              <dt>Roll number</dt>
              <dd>{roll_id}</dd>
            </>
          )}
          {dateShot && (
            <>
              <dt>Date</dt>
              <dd>{dateShot}</dd>
            </>
          )}
          {camera && (
            <>
              <dt>Camera</dt>
              <dd>{camera}</dd>
            </>
          )}
          {film && (
            <>
              <dt>Film</dt>
              <dd>{film}</dd>
            </>
          )}
          {lensesList.length > 0 && (
            <>
              <dt>Lenses</dt>
              <dd>{lensesList.join(", ")}</dd>
            </>
          )}
          {film_speed != null && film_speed !== "" && (
            <>
              <dt>Film speed</dt>
              <dd>{film_speed}</dd>
            </>
          )}
          {developer && (
            <>
              <dt>Developer</dt>
              <dd>{developer}</dd>
            </>
          )}
          {locationsList.length > 0 && (
            <>
              <dt>Locations</dt>
              <dd>{locationsList.map((loc) => (typeof loc === "string" ? loc : loc?.Location ?? loc)).join(", ")}</dd>
            </>
          )}
          {tagsList.length > 0 && (
            <>
              <dt>Tags</dt>
              <dd>{tagsList.join(", ")}</dd>
            </>
          )}
          {(start_date || end_date) && (
            <>
              <dt>Shot</dt>
              <dd>
                {start_date && formatDate(start_date)}
                {start_date && end_date && " – "}
                {end_date && formatDate(end_date)}
              </dd>
            </>
          )}
          {comments != null && String(comments).trim() !== "" && (
            <>
              <dt>Comments</dt>
              <dd className="cms-preview-comments-body">{widgetFor("comments")}</dd>
            </>
          )}
        </dl>
      </section>

      {images.length > 0 && (
        <section className="cms-preview-images">
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
        </section>
      )}
    </article>
  );
}

export default RollPreview;
