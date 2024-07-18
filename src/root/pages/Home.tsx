import PostCard from "@/components/ui/shared/PostCard";
import PostLoader from "@/components/ui/shared/PostLoader";
import { useGetRecentPosts } from "@/lib/react-query/querriesAndMutations";
import { Models } from "appwrite";

const Home = () => {
  const { data: postsData, isPending: isPostLoading, isError, error } = useGetRecentPosts();

  if (isError) {
    console.error("Error fetching posts:", error);
    return <div>Error loading posts. Please try again later.</div>;
  }

  return (
    <div className="flex flex-1">
      <div className="home-container">
        <div className="home-posts">
          <h2 className="h3-bold md:h2-bold text-left w-full">Home Feed</h2>
          {isPostLoading ? (
            <PostLoader />
          ) : (
            <ul className="flex flex-col flex-1 gap-9 w-full">
              {postsData?.documents.map((post: Models.Document)=>(
                <PostCard post={post}/>
              ))}
              
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;