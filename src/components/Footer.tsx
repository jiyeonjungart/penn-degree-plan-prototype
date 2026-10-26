export function Footer() {
  return (
    <footer className="footer">
      <p className="footer-disclaimer">
        Penn Degree Plan is not an official University of Pennsylvania resource.
        For actual degree planning, please consult your academic advisor.
      </p>
      <span className="footer-credit">
        Made with <span className="heart">♥</span> by{" "}
        <a
          href="https://pennlabs.org"
          target="_blank"
          rel="noreferrer"
        >
          Penn Labs
        </a>
        . Have feedback about Penn Degree Plan?{" "}
        <a
          href="https://airtable.com/shrKpP4iRVtzFi0eA"
          target="_blank"
          rel="noreferrer"
        >
          Let us know here
        </a>
        !
      </span>
    </footer>
  );
}
