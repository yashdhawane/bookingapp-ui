import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
  <>
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="container mx-auto py-20 text-center">
        <h1 className="text-6xl sm:text-7xl lg:text-8xl font-extrabold gradient-title pb-6 flex flex-col">
          Streamline Your Workflow <br />
          <span className="flex mx-auto gap-3 sm:gap-4 items-center">
            with
            {/* <Image
              src={"/logo2.png"}
              alt="Zscrum Logo"
              width={400}
              height={80}
              className="h-14 sm:h-24 w-auto object-contain"
              /> */}
          </span>
        </h1>
        <p className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto"> Empower your team with our intuitive project management solution.</p>
        <Link href="/login">
          <button size="lg" className="m-4 bg-red-800">
            Login
          </button>
        </Link>
        <Link href="/signup">
          <button size="lg" variant="outline" className="m-4 bg-blue-600">
            Signup
          </button>
        </Link>
        </section>
        </div>
    </>
  );
}
     

