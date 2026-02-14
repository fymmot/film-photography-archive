import React from "react";
import CMS from "decap-cms-app";
import RollPreview from "./previews/RollPreview";
import FeaturePreview from "./previews/FeaturePreview";

CMS.registerPreviewStyle("/admin/style.css");
CMS.registerPreviewTemplate("rolls", RollPreview);
CMS.registerPreviewTemplate("features", FeaturePreview);

CMS.init();
