import { Models } from "appwrite";
import { Link } from "react-router-dom";
import { formatDistanceToNow, parseISO } from "date-fns";
import { useUserContext } from "@/context/AuthContext";
import ProfileStats from "./PostStats";

type PostCardProp = {
  post: Models.Document;
};

const PostCard = ({ post }: PostCardProp) => {
  const timeAgo = (timestamp: string) => {
    return formatDistanceToNow(parseISO(timestamp), { addSuffix: true });
  };
  const { user } = useUserContext();
  return (
    <div className="post-card">
      <div className="flex-between">
        <div className="flex items-center gap-3">
          <Link to={`/profile/${post.creator.$id}`}>
            <img
              src={
                user.imageUrl || "/assets/icons/profile-placeholder.svg"
              }
              alt="Profile img"
              className="rounded-full w-12 lg:h-12"
            />
          </Link>
          <div className="flex flex-col">
            <p className="base-medium lg:body-bold text-light-1">
              {post.creator.name}
            </p>
            <div className="flex-center gap-2 text-light-3">
              <p className="subtle-semibold lg:small-regular">
                {timeAgo(post.$createdAt)}
              </p>
              -
              <p className="subtle-semibold lg:small-regular">
                {post.location}
              </p>
            </div>
          </div>
        </div>
        <Link
          to={`/update-post/${post.$id}`}
          className={`${
            user.id !== post.creator.$id && "hidden"
          } cursor-pointer`}
        >
          <img src="/assets/icons/edit.svg" alt="edit" width={20} height={20} />
        </Link>
      </div>
      <Link to={`/posts/${post.$id}`} className="cursor-pointer">
        <div className="small-medium lg:base-medium py-5">
          <p className="pb-3">{post.caption}</p>
          <ul className="flex gap-1">
            {post.tags.map((tag: string, index: number) => (
              <li key={index} className="text-light-3">
                #{tag}
              </li>
            ))}
          </ul>
        </div>

        <img
          src={post.imageUrl || "/assets/icons/profile-placeholder.svg"}
          className="post-card_img"
          alt="post image"
        />
      </Link>
      <ProfileStats post={post} userId={user.id} />
    </div>
  );
};

export default PostCard;
