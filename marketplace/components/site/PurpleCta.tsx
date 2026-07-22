import Button from "./Button";

/** Purple call-to-action band — centred, with "life's busy" outline pill,
    tan "Put your feet up" underline, and arrow-shaped "Start with" box. */
export default function PurpleCta() {
  return (
    <section className="pcta bg-purple" aria-label="Get started">
      <div className="container">
        <div className="pcta__inner reveal">
          <h4 className="pcta__title">
            <span className="pcta__line">
              Time&rsquo;s precious and{" "}
              <span className="pcta__pill">life&rsquo;s busy</span>
            </span>
            <span className="pcta__line">
              <span className="pcta__feet">Put your feet up</span> and let Adam do
              all the leg work.
            </span>
          </h4>
          <div className="pcta__action">
            <span className="pcta__start">Start with</span>
            <Button to="/buy-my-car" variant="green" arrow>
              Buy My Car
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
