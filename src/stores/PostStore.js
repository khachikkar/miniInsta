import { makeAutoObservable, runInAction } from 'mobx';
import { supabase } from '../supabaseClient';

class PostStore {
  posts = [];
  isLoading = false;
  error = null;

  constructor() {
    makeAutoObservable(this);
  }

  async fetchPosts() {
    this.isLoading = true;
    this.error = null;
    
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      runInAction(() => {
        this.posts = data;
        this.isLoading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.error = 'Failed to load posts';
        this.isLoading = false;
      });
    }
  }

  async addPost(post) {
    try {
      const { data, error } = await supabase
        .from('posts')
        .insert([post])
        .select();

      if (error) throw error;

      runInAction(() => {
        this.posts = [data[0], ...this.posts];
      });

      return data[0];
    } catch (error) {
      runInAction(() => {
        this.error = 'Failed to create post';
      });
      throw error;
    }
  }
}

export const postStore = new PostStore();
