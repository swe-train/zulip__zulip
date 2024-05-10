import $ from "jquery";

import {user_settings} from "./user_settings";

// These are all relative-unit values for Source Sans Pro VF,
// as opened and inspected in FontForge.
// Source Sans Prof VF reports an em size of 1000, which is
// necessary to know to calculate proper em units.
const BODY_FONT_EM_SIZE = 1000;
// The Typo Ascent Value is reported as 1024, but both Chrome
// and Firefox act as though it is 1025, so that value is used
// here. It represents the portion of the content box above the
// baseline.
const BODY_FONT_ASCENT = 1025;
// The Typo Descent Value is reported as 400. It is the portion
// of the content box below the baseline.
const BODY_FONT_DESCENT = 400;
// The BODY_FONT_CONTENT_BOX size is calculated by adding the
// Typo Ascent and Typo Descent values. The content box for
// Source Sans Pro VF exceeds the size of its em box, meaning
// that the `font-size` value will render text that is smaller
// than the size of the content area. For example, setting
// `font-size: 100px` on Source Sans Prof VF produces a content
// area of 142.5px.
// Note also that the content box is therefore clipped when the
// line-height (in ems or as a unitless value) is less than the
// MAXIMUM_BLOCK_HEIGHT_IN_EMS as calculated below.
const BODY_FONT_CONTENT_BOX = BODY_FONT_ASCENT + BODY_FONT_DESCENT;
// The maximum block height is derived from the content area
// made by an anonymous text node in Source Sans Pro VF.
// This ensures that even as line heights scale above 1.425,
// text-adjacent elements can be sized in scale to the text's
// content area. This is necessary to know, because an element
// such as a checkbox or emoji looks nice occupying the full
// line-height, but only when the text's content area is less
// than the line-height.
const MAXIMUM_BLOCK_HEIGHT_IN_EMS = BODY_FONT_CONTENT_BOX / BODY_FONT_EM_SIZE;

// Eventually this legacy value and references to it should be removed;
// but in the awkward stage where legacy values are in play for
// certain things (e.g., calculating line-height-based offsets for
// emoji alignment), it's necessary to have access to this value.
const LEGACY_LINE_HEIGHT_UNITLESS = 1.214;

function set_vertical_alignment_values(font_size_px: number, line_height_unitless: number): void {
    // We work in pixels to make these calculations easier to grasp,
    // but convert to ems before setting CSS variables.
    const base_line_height_in_pixels = font_size_px * line_height_unitless;
    const base_content_box_in_pixels = font_size_px * (BODY_FONT_CONTENT_BOX / BODY_FONT_EM_SIZE);
    const space_below_baseline_unitless = BODY_FONT_DESCENT / BODY_FONT_CONTENT_BOX;

    // We can now determine how large of an area sits below the baseline;
    // that is necessary to know when determining the correct numerical
    // offset for `vertical-align`.
    const descent_area_in_pixels = space_below_baseline_unitless * base_content_box_in_pixels;
    // We calculate the difference between the line height and the content
    // box
    const line_height_difference = base_content_box_in_pixels - base_line_height_in_pixels;
    let vertical_align_offset_in_pixels;
    if (line_height_difference > 0) {
        // When the difference is greater than zero, we have excess line-height
        // to account for when determining the correct vertical-align offset,
        // so we subtract the descent area from half the line height difference
        // (browsers split the difference equally, with half above and half below
        // the text on a line).
        vertical_align_offset_in_pixels = line_height_difference / 2 - descent_area_in_pixels;
    } else {
        // When the difference is zero or less, we have to account for the
        // clipping of the descent area when determining the correct vertical-align
        // offset. To do this, we add the descent area to half the line height
        // difference, which will be a negative number.
        vertical_align_offset_in_pixels = line_height_difference / 2 + descent_area_in_pixels;
    }

    // Finally, we convert the offset value to ems, so that it works with headings.
    const vertical_align_offset_in_ems = vertical_align_offset_in_pixels / font_size_px;

    $(":root").css("--base-maximum-block-height-em", `${MAXIMUM_BLOCK_HEIGHT_IN_EMS}em`);
    $(":root").css(
        "--base-inline-block-vertical-alignment-em",
        `${vertical_align_offset_in_ems}em`,
    );
}

export function set_base_typography_css_variables(): void {
    const font_size_px = user_settings.web_font_size_px;
    const line_height_percent = user_settings.web_line_height_percent;
    const line_height_unitless = user_settings.dense_mode
        ? LEGACY_LINE_HEIGHT_UNITLESS
        : line_height_percent / 100;
    const line_height_px = line_height_unitless * font_size_px;
    /* This percentage is a legacy value, rounding up from .294;
       additional logic might be useful to make this adjustable;
       likewise with the doubled value. */
    const markdown_interelement_space_fraction = 0.3;
    const markdown_interelement_space_px = line_height_px * markdown_interelement_space_fraction;

    $(":root").css("--base-line-height-unitless", line_height_unitless);
    $(":root").css("--base-font-size-px", `${font_size_px}px`);
    $(":root").css("--markdown-interelement-space-px", `${markdown_interelement_space_px}px`);
    $(":root").css(
        "--markdown-interelement-doubled-space-px",
        `${markdown_interelement_space_px * 2}px`,
    );

    set_vertical_alignment_values(font_size_px, line_height_unitless);
}

export function initialize(): void {
    set_base_typography_css_variables();
}
