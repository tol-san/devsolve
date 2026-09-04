import Link from "next/link";
import {
  Cake,
  CalendarDays,
  Globe,
  MapPin,
  Phone,
  Users,
  VenusAndMars,
} from "lucide-react";
import { CountryDisplay } from "@/components/shared/CountryDisplay";
import { Profile } from "@/lib/types/profile/types";
import { SiGithub, SiX } from "react-icons/si";

interface ProfileBioProps {
  profile: Profile;
}

const GENDER_LABELS: Record<NonNullable<Profile["gender"]>, string> = {
  MALE: "Male",
  FEMALE: "Female",
  OTHER: "Other",
};

function formatDateOfBirth(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// The edit form asks for full URLs (e.g. "https://github.com/username" — see
// the editor's placeholders), so social links are stored that way. Build the
// href straight from the stored value instead of re-prefixing a domain onto
// it, which previously produced broken/duplicated URLs like
// "github.com/https://github.com/handle" whenever a user followed the form's
// own placeholder guidance.
function toHref(value: string): string {
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

function displayUrl(value: string): string {
  return value.replace(/^https?:\/\//i, "").replace(/\/$/, "");
}

/**
 * Label above value on phones, beside it from `sm` up. A fixed 112px label
 * column left roughly 160px for the value on a 320px screen, which a GitHub
 * URL blows straight through.
 */
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-start sm:gap-4">
      <span className="shrink-0 text-sm font-medium text-slate-700 sm:w-28 sm:pt-px dark:text-neutral-300">
        {label}
      </span>
      <span className="flex min-w-0 items-center gap-1.5 text-sm font-medium text-slate-900 dark:text-neutral-100">
        {children}
      </span>
    </div>
  );
}

const iconClass = "size-4 shrink-0 text-slate-500 dark:text-neutral-400";
const linkClass =
  "flex min-w-0 items-center gap-1.5 font-semibold text-blue-600 hover:underline dark:text-blue-400";

export default function ProfileBio({ profile }: ProfileBioProps) {
  const {
    bio,
    location,
    memberSince,
    socialLinks,
    followers,
    following,
    username,
    phone,
    dateOfBirth,
    gender,
  } = profile;

  const hasContact =
    location ||
    phone ||
    socialLinks.website ||
    socialLinks.github ||
    socialLinks.twitter;

  return (
    <div className="space-y-6 pt-2">
      {hasContact && (
        <div>
          <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400">
            Contact Information
          </h3>

          <div className="grid grid-cols-1 gap-x-6 gap-y-3.5 sm:grid-cols-2">
            {location && (
              <Row label="Country:">
                <MapPin className={iconClass} />
                {/* `location` is the profile's `country` field. Usually an ISO
                    code now; older profiles hold free text, which renders as
                    written without a flag. */}
                <CountryDisplay value={location} className="min-w-0" />
              </Row>
            )}

            {phone && (
              <Row label="Phone:">
                <Phone className={iconClass} />
                <span className="truncate">{phone}</span>
              </Row>
            )}

            {socialLinks.website && (
              <Row label="Site:">
                <a
                  href={toHref(socialLinks.website)}
                  target="_blank"
                  rel="noreferrer"
                  className={linkClass}
                >
                  <Globe className="size-4 shrink-0 text-blue-500" />
                  <span className="truncate">
                    {displayUrl(socialLinks.website)}
                  </span>
                </a>
              </Row>
            )}

            {socialLinks.github && (
              <Row label="GitHub:">
                <a
                  href={toHref(socialLinks.github)}
                  target="_blank"
                  rel="noreferrer"
                  className={linkClass}
                >
                  <SiGithub className="size-4 shrink-0 text-slate-700 dark:text-neutral-300" />
                  <span className="truncate">
                    {displayUrl(socialLinks.github)}
                  </span>
                </a>
              </Row>
            )}

            {socialLinks.twitter && (
              <Row label="X (Twitter):">
                <a
                  href={toHref(socialLinks.twitter)}
                  target="_blank"
                  rel="noreferrer"
                  className={linkClass}
                >
                  <SiX className="size-4 shrink-0 text-slate-700 dark:text-neutral-300" />
                  <span className="truncate">
                    {displayUrl(socialLinks.twitter)}
                  </span>
                </a>
              </Row>
            )}
          </div>
        </div>
      )}

      <div
        className={
          hasContact
            ? "border-t border-slate-200/80 pt-5 dark:border-neutral-800"
            : undefined
        }
      >
        <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400">
          Basic Information
        </h3>

        <div className="mb-4 grid grid-cols-1 gap-x-6 gap-y-3.5 sm:grid-cols-2">
          <Row label="Member Since:">
            <CalendarDays className={iconClass} />
            <span className="truncate">{memberSince}</span>
          </Row>

          <Row label="Community:">
            <Users className={iconClass} />
            {/* Wraps rather than truncates — both counts have to stay tappable */}
            <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <Link
                href={`/dashboard/profile/${username}/followers`}
                className="hover:text-blue-600 hover:underline dark:hover:text-blue-400"
              >
                {followers} followers
              </Link>
              <span className="text-slate-400">•</span>
              <Link
                href={`/dashboard/profile/${username}/following`}
                className="hover:text-blue-600 hover:underline dark:hover:text-blue-400"
              >
                {following} following
              </Link>
            </span>
          </Row>

          {dateOfBirth && (
            <Row label="Date of Birth:">
              <Cake className={iconClass} />
              <span className="truncate">{formatDateOfBirth(dateOfBirth)}</span>
            </Row>
          )}

          {gender && (
            <Row label="Sex:">
              <VenusAndMars className={iconClass} />
              <span className="truncate">{GENDER_LABELS[gender]}</span>
            </Row>
          )}
        </div>

        {bio && (
          <div className="mt-3 rounded-2xl border border-slate-200/80 bg-slate-50 p-4 dark:border-neutral-800 dark:bg-neutral-900/60">
            <p className="mb-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400">
              About
            </p>
            {/* Wrapping mid-word so an unbroken string can't widen the page */}
            <p className="text-sm leading-relaxed text-slate-700 wrap-break-word dark:text-neutral-300">
              {bio}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
